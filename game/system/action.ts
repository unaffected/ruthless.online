import type { Game, System } from '@/game'
import actions from '@/game/action'
import event from '@/game/system/event'
import * as hook from '@/game/utility/hook'
import { ACTION_TYPE, ACTION_PHASE, ACTION_CONDITION } from '@/game/config/action'
import type { Action as ActionDef, ActionState, ActionContext } from '@/game/config/action'

export { 
  ACTION_TYPE,
  ACTION_PHASE,
  ACTION_CONDITION,
  type ActionType,
  type ActionPhase,
  type ActionCondition,
  type ActionState,
  type ActionContext,
  type ACTION,
  type Action,
  type Actions
} from '@/game/config/action'

declare module '@/game' {
  interface Game {
    action: {
      definitions: Map<string, ActionDef>
      states: Map<number, Map<string, ActionState>>
      activate: (id: string, entity: number, params?: any) => boolean
      cancel: (id: string, entity: number) => boolean
      state: (id: string, entity: number) => ActionState | undefined
    }
  }
}

declare module '@/game/system/event' {
  interface Events {
    'game:action:activated': { entity: number, action_id: string }
    'game:action:cancelled': { entity: number, action_id: string }
    'game:action:phase_changed': { entity: number, action_id: string, phase: number }
  }
}

export const system: System = {
  id: 'game:action',
  dependencies: [event],

  install: async (game) => {
    game.action = {
      definitions: new Map(),
      states: new Map(),
      
      activate: (id, entity, params) => {
        const action = game.action.definitions.get(id)

        if (!action) return false
        
        let states = game.action.states.get(entity)

        if (!states) {
          states = new Map()
          game.action.states.set(entity, states)
        }
        
        let state = states.get(id)

        if (!state) {
          state = { phase: ACTION_PHASE.IDLE, phase_started_at: performance.now(), charge_value: 0, last_activated: 0 }
          states.set(id, state)
        }
        
        if (!check_conditions(game, action, entity)) return false
        
        const ctx: ActionContext = { game, entity, state, action, delta: 0, params }
        
        if (action.type === ACTION_TYPE.CHANNELED) return activate_channeled(game, action, entity, state, id, ctx)
        if (action.type === ACTION_TYPE.ACTIVATED) return activate_activated(game, action, entity, state, id, ctx)
        if (action.type === ACTION_TYPE.PASSIVE) return activate_passive(game, action, entity, state, id, ctx)
        
        return false
      },
      
      cancel: (id, entity) => {
        const states = game.action.states.get(entity)

        if (!states) return false
        
        const state = states.get(id)

        if (!state) return false
        
        const action = game.action.definitions.get(id)

        if (!action) return false
        
        const ctx: ActionContext = { game, entity, state, action, delta: 0 }
        
        action.on_cancel?.(ctx)
        hook.call(action, 'deactivate', ctx)
        
        state.phase = ACTION_PHASE.IDLE
        state.phase_started_at = performance.now()
        state.charge_value = 0
        
        game.emit('game:action:cancelled', { entity, action_id: id })
        
        return true
      },
      
      state: (id, entity) => game.action.states.get(entity)?.get(id)
    }

    actions.forEach((action) => game.action.definitions.set(String(action.id), action as ActionDef))
  },

  tick: async (game, delta) => {
    const now = performance.now()
    
    for (const [entity, states] of game.action.states) {
      if (!game.exists(entity)) {
        game.action.states.delete(entity)

        continue
      }
      
      for (const [action_id, state] of states.entries()) {
        const action = game.action.definitions.get(action_id)

        if (!action) continue
        
        const ctx: ActionContext = { game, entity, state, action, delta }
        action.on_tick?.(ctx)
        
        if (action.type === ACTION_TYPE.CHANNELED) tick_channeled(game, action, entity, action_id, state, ctx, delta)
        if (action.type === ACTION_TYPE.ACTIVATED) tick_activated(game, action, entity, action_id, state, ctx, now)
      }
    }
  }
}

function check_conditions(game: Game, action: ActionDef, entity: number): boolean {
  if (!action.conditions) return true
  
  const velocity = game.get(entity, 'velocity')
  const is_moving = velocity && (velocity.x !== 0 || velocity.y !== 0)
  
  if ((action.conditions & ACTION_CONDITION.MOVING) && !is_moving) return false
  if ((action.conditions & ACTION_CONDITION.STANDING) && is_moving) return false
  
  return true
}

function consume_cost(game: Game, action: ActionDef, entity: number, state: ActionState, params: any): boolean {
  if (!action.energy_cost) return true
  
  const stats = game.get(entity, 'stats')
  const cost = typeof action.energy_cost === 'function'
    ? action.energy_cost({ game, entity, state, action, delta: 0, params })
    : action.energy_cost
  
  if (!stats || stats.energy_current < cost) return false
  
  const new_energy = stats.energy_current - cost
  game.set(entity, 'stats', { energy_current: new_energy })
  
  console.debug(`[game:action] ${action.id} activation cost ${cost} energy (${stats.energy_current.toFixed(1)} -> ${new_energy.toFixed(1)})`)

  return true
}

function activate_channeled(game: Game, action: ActionDef, entity: number, state: ActionState, id: string, ctx: ActionContext): boolean {
  if (state.phase === ACTION_PHASE.ACTIVE) {
    state.params = ctx.params
    return true
  }
  
  if (state.phase !== ACTION_PHASE.IDLE) return false
  if (!consume_cost(game, action, entity, state, ctx.params)) return false
  
  state.phase = ACTION_PHASE.ACTIVE
  state.phase_started_at = performance.now()
  state.params = ctx.params
  
  hook.call(action, 'activate', ctx)
  hook.call(action, 'channel', ctx)
  
  game.emit('game:action:activated', { entity, action_id: id })
  return true
}

function activate_activated(game: Game, action: ActionDef, entity: number, state: ActionState, id: string, ctx: ActionContext): boolean {
  if (state.phase !== ACTION_PHASE.IDLE && state.phase !== ACTION_PHASE.COOLDOWN) return false
  
  const now = performance.now()
  
  if (state.phase === ACTION_PHASE.COOLDOWN) {
    if (now - state.phase_started_at < (action.cooldown_duration ?? 0)) return false
  }
  
  if (!consume_cost(game, action, entity, state, ctx.params)) return false
  
  state.phase = action.startup_duration && action.startup_duration > 0 ? ACTION_PHASE.STARTUP : ACTION_PHASE.ACTIVE
  state.phase_started_at = now
  state.last_activated = now
  
  if (state.phase === ACTION_PHASE.STARTUP) {
    hook.call(action, 'startup', ctx)
  } else {
    hook.call(action, 'activate', ctx)
    hook.call(action, 'active', ctx)
  }
  
  game.emit('game:action:activated', { entity, action_id: id })
  return true
}

function activate_passive(game: Game, action: ActionDef, entity: number, state: ActionState, id: string, ctx: ActionContext): boolean {
  if (state.phase !== ACTION_PHASE.IDLE) return false
  if (!consume_cost(game, action, entity, state, ctx.params)) return false
  
  state.phase = ACTION_PHASE.ACTIVE
  state.phase_started_at = performance.now()
  
  action.on_equip?.(ctx)
  hook.call(action, 'activate', ctx)
  
  game.emit('game:action:activated', { entity, action_id: id })
  return true
}

function tick_channeled(game: Game, action: ActionDef, entity: number, action_id: string, state: ActionState, ctx: ActionContext, delta: number): void {
  if (state.phase !== ACTION_PHASE.ACTIVE) return
  
  if (action.energy_cost_per_second) {
    const cost = action.energy_cost_per_second * (delta / 1000)
    const stats = game.get(entity, 'stats')
    
    if (!stats || stats.energy_current < cost) {
      console.debug(`[game:action] ${action_id} out of energy, cancelling`)
      game.action.cancel(action_id, entity)
      return
    }
    
    const new_energy = stats.energy_current - cost
    game.set(entity, 'stats', { energy_current: new_energy })
    
    console.debug(`[game:action] ${action_id} tick cost ${cost.toFixed(2)} energy (delta ${delta.toFixed(1)}ms, ${stats.energy_current.toFixed(1)} -> ${new_energy.toFixed(1)})`)
  }
  
  ctx.params = state.params
  action.on_channel_tick?.(ctx)
}

function tick_activated(game: Game, action: ActionDef, entity: number, action_id: string, state: ActionState, ctx: ActionContext, now: number): void {
  if (state.phase === ACTION_PHASE.STARTUP) tick_startup(game, action, entity, action_id, state, ctx, now)
  if (state.phase === ACTION_PHASE.ACTIVE) tick_active(game, action, entity, action_id, state, ctx, now)
  if (state.phase === ACTION_PHASE.RECOVERY) tick_recovery(game, action, entity, action_id, state, ctx, now)
  if (state.phase === ACTION_PHASE.COOLDOWN) tick_cooldown(game, action, entity, action_id, state, ctx, now)
}

function tick_startup(game: Game, action: ActionDef, entity: number, action_id: string, state: ActionState, ctx: ActionContext, now: number): void {
  action.on_startup_tick?.(ctx)
  
  const elapsed = now - state.phase_started_at
  if (elapsed < (action.startup_duration ?? 0)) return
  
  state.phase = ACTION_PHASE.ACTIVE
  state.phase_started_at = now
  
  hook.call(action, 'active', ctx)

  game.emit('game:action:phase_changed', { entity, action_id, phase: ACTION_PHASE.ACTIVE })
}

function tick_active(game: Game, action: ActionDef, entity: number, action_id: string, state: ActionState, ctx: ActionContext, now: number): void {
  action.on_active_tick?.(ctx)
  
  const elapsed = now - state.phase_started_at

  if (elapsed < (action.active_duration ?? 0)) return
  
  state.phase = ACTION_PHASE.RECOVERY
  state.phase_started_at = now
  
  hook.call(action, 'recovery', ctx)

  game.emit('game:action:phase_changed', { entity, action_id, phase: ACTION_PHASE.RECOVERY })
}

function tick_recovery(game: Game, action: ActionDef, entity: number, action_id: string, state: ActionState, ctx: ActionContext, now: number): void {
  action.on_recovery_tick?.(ctx)
  
  const elapsed = now - state.phase_started_at

  if (elapsed < (action.recovery_duration ?? 0)) return
  
  state.phase_started_at = now
  state.phase = action.cooldown_duration && action.cooldown_duration > 0 ? ACTION_PHASE.COOLDOWN : ACTION_PHASE.IDLE
  
  if (state.phase === ACTION_PHASE.COOLDOWN) {
    hook.call(action, 'cooldown', ctx)
  }
  
  game.emit('game:action:phase_changed', { entity, action_id, phase: state.phase })
}

function tick_cooldown(game: Game, action: ActionDef, entity: number, action_id: string, state: ActionState, ctx: ActionContext, now: number): void {
  action.on_cooldown_tick?.(ctx)
  
  const elapsed = now - state.phase_started_at

  if (elapsed < (action.cooldown_duration ?? 0)) return
  
  state.phase = ACTION_PHASE.IDLE
  state.phase_started_at = now
  
  game.emit('game:action:phase_changed', { entity, action_id, phase: ACTION_PHASE.IDLE })
}

export default system
