import type { Game } from '@/game'
import type { Action, ActionState, ActionContext, ActionType, ActionPhase, ActionCondition } from '@/game/config/action'
import { ACTION_TYPE, ACTION_PHASE, ACTION_CONDITION } from '@/game/config/action'
import * as hook from '@/game/utility/hook'

export function activate(
  game: Game,
  id: string,
  entity: number,
  params: any = {}
): boolean {
  const action = game.action.definitions.get(id)
  
  if (!action) {
    console.warn(`[game:action] action '${id}' not found`)
    return false
  }

  const entity_states = ensure_entity_states(game, entity)
  const state = ensure_state(entity_states, id)
  const now = performance.now()

  if (action.type === ACTION_TYPE.CHANNELED) {
    return activate_channeled(game, action, entity, state, params, id, now)
  }

  if (action.type === ACTION_TYPE.ACTIVATED) {
    return activate_activated(game, action, entity, state, params, id, now)
  }

  if (action.type === ACTION_TYPE.PASSIVE || action.type === ACTION_TYPE.TRIGGERED) {
    return activate_passive(game, action, entity, state, params, id, now)
  }

  return false
}

export function cancel(game: Game, id: string, entity: number): boolean {
  const entity_states = game.action.states.get(entity)
  
  if (!entity_states) return false

  const state = entity_states.get(id)
  
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
}

export function tick(game: Game, delta: number): void {
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

      if (action.type === ACTION_TYPE.CHANNELED) {
        tick_channeled(game, action, entity, action_id, state, ctx, now, delta)
      }

      if (action.type === ACTION_TYPE.ACTIVATED) {
        tick_activated(game, action, entity, action_id, state, ctx, now)
      }

      if (action.type === ACTION_TYPE.PASSIVE && state.phase === ACTION_PHASE.ACTIVE) {
        action.on_active_tick?.(ctx)
      }
    }
  }
}

function ensure_entity_states(game: Game, entity: number): Map<string, ActionState> {
  const existing = game.action.states.get(entity)
  
  if (existing) return existing

  const entity_states = new Map<string, ActionState>()
  
  game.action.states.set(entity, entity_states)
  
  return entity_states
}

function ensure_state(entity_states: Map<string, ActionState>, id: string): ActionState {
  const existing = entity_states.get(id)

  if (existing) return existing

  const now = performance.now()
  const state: ActionState = {
    phase: ACTION_PHASE.IDLE,
    phase_started_at: now,
    charge_value: 0,
    last_activated: 0,
    params: undefined
  }

  entity_states.set(id, state)
  
  return state
}

function activate_channeled(
  game: Game,
  action: Action,
  entity: number,
  state: ActionState,
  params: any,
  id: string,
  now: number
): boolean {
  if (state.phase === ACTION_PHASE.IDLE) {
    state.phase = ACTION_PHASE.ACTIVE
    state.phase_started_at = now
    state.params = params
    
    const ctx: ActionContext = { game, entity, state, action, delta: 0, params }

    hook.call(action, 'activate', ctx)
    hook.call(action, 'channel', ctx)
    
    game.emit('game:action:activated', { entity, action_id: id })

    return true
  }

  if (state.phase === ACTION_PHASE.ACTIVE) {
    state.params = params

    return true
  }

  return false
}

function activate_activated(
  game: Game,
  action: Action,
  entity: number,
  state: ActionState,
  params: any,
  id: string,
  now: number
): boolean {
  if (state.phase !== ACTION_PHASE.IDLE && state.phase !== ACTION_PHASE.COOLDOWN) {
    return false
  }

  if (state.phase === ACTION_PHASE.COOLDOWN) {
    if (now - state.phase_started_at < (action.cooldown_duration ?? 0)) return false
  }

  if (!check_conditions(game, action, entity)) {
    return false
  }

  if (!consume_energy(game, action, entity, state, params)) {
    return false
  }

  state.phase = action.startup_duration && action.startup_duration > 0
    ? ACTION_PHASE.STARTUP
    : ACTION_PHASE.ACTIVE
  
  state.phase_started_at = now
  state.last_activated = now

  const ctx: ActionContext = { game, entity, state, action, delta: 0, params }
  
  if (state.phase === ACTION_PHASE.STARTUP) {
    hook.call(action, 'startup', ctx)
  } else {
    hook.call(action, 'activate', ctx)
    hook.call(action, 'active', ctx)
  }

  game.emit('game:action:activated', { entity, action_id: id })
  
  return true
}

function activate_passive(
  game: Game,
  action: Action,
  entity: number,
  state: ActionState,
  params: any,
  id: string,
  now: number
): boolean {
  if (state.phase !== ACTION_PHASE.IDLE) return false

  state.phase = ACTION_PHASE.ACTIVE
  state.phase_started_at = now

  const ctx: ActionContext = { game, entity, state, action, delta: 0, params }

  action.on_equip?.(ctx)
  hook.call(action, 'activate', ctx)

  game.emit('game:action:activated', { entity, action_id: id })

  return true
}

function check_conditions(game: Game, action: Action, entity: number): boolean {
  if (!action.conditions) return true

  const velocity = game.get(entity, 'velocity')
  if (!velocity) return false

  const is_moving = velocity.x !== 0 || velocity.y !== 0

  if (action.conditions & ACTION_CONDITION.MOVING) {
    if (!is_moving) return false
  }

  if (action.conditions & ACTION_CONDITION.STANDING) {
    if (is_moving) return false
  }

  return true
}

function consume_energy(
  game: Game,
  action: Action,
  entity: number,
  state: ActionState,
  params: any
): boolean {
  const energy_cost = typeof action.energy_cost === 'function'
    ? action.energy_cost({ game, entity, state, action, delta: 0, params })
    : (action.energy_cost ?? 0)

  if (energy_cost <= 0) return true

  const stats = game.get(entity, 'stats')
  
  if (!stats || stats.energy_current < energy_cost) return false

  game.set(entity, 'stats', { energy_current: stats.energy_current - energy_cost })
  
  return true
}

function tick_channeled(
  game: Game,
  action: Action,
  entity: number,
  action_id: string,
  state: ActionState,
  ctx: ActionContext,
  now: number,
  delta: number
): void {
  if (state.phase !== ACTION_PHASE.ACTIVE) return

  ctx.params = state.params
  action.on_channel_tick?.(ctx)

  if (!consume_energy_per_tick(game, action, entity, action_id, delta)) return

  check_max_channel(game, action, action_id, entity, state, now)
}

function consume_energy_per_tick(
  game: Game,
  action: Action,
  entity: number,
  action_id: string,
  delta: number
): boolean {
  if (!action.energy_cost_per_tick) return true

  const cost = action.energy_cost_per_tick * delta
  const stats = game.get(entity, 'stats')
  
  if (!stats || stats.energy_current < cost) {
    game.action.cancel(action_id, entity)

    return false
  }

  game.set(entity, 'stats', { energy_current: stats.energy_current - cost })

  return true
}

function check_max_channel(
  game: Game,
  action: Action,
  action_id: string,
  entity: number,
  state: ActionState,
  now: number
): void {
  if (!action.max_channel_duration) return

  const elapsed = now - state.phase_started_at

  if (elapsed >= action.max_channel_duration) {
    game.action.cancel(action_id, entity)
  }
}

function tick_activated(
  game: Game,
  action: Action,
  entity: number,
  action_id: string,
  state: ActionState,
  ctx: ActionContext,
  now: number
): void {
  const elapsed = now - state.phase_started_at

  if (state.phase === ACTION_PHASE.STARTUP) {
    tick_startup(game, action, entity, action_id, state, ctx, elapsed, now)
  }

  if (state.phase === ACTION_PHASE.ACTIVE) {
    tick_active(game, action, entity, action_id, state, ctx, elapsed, now)
  }

  if (state.phase === ACTION_PHASE.RECOVERY) {
    tick_recovery(game, action, entity, action_id, state, ctx, elapsed, now)
  }

  if (state.phase === ACTION_PHASE.COOLDOWN) {
    tick_cooldown(game, action, entity, action_id, state, ctx, elapsed, now)
  }
}

function transition_phase(
  game: Game,
  action: Action,
  entity: number,
  action_id: string,
  state: ActionState,
  ctx: ActionContext,
  elapsed: number,
  duration: number,
  next_phase: ActionPhase,
  phase_name: 'startup' | 'active' | 'recovery' | 'cooldown',
  now: number
): boolean {
  const tick_fn = action[`on_${phase_name}_tick` as keyof Action]
  if (typeof tick_fn === 'function') tick_fn(ctx)
  
  if (elapsed < duration) return false
  
  state.phase = next_phase
  state.phase_started_at = now
  
  return true
}

function tick_startup(
  game: Game,
  action: Action,
  entity: number,
  action_id: string,
  state: ActionState,
  ctx: ActionContext,
  elapsed: number,
  now: number
): void {
  if (!transition_phase(game, action, entity, action_id, state, ctx, elapsed, action.startup_duration ?? 0, ACTION_PHASE.ACTIVE, 'startup', now)) return
  
  hook.call(action, 'active', ctx)
  game.emit('game:action:phase_changed', { entity, action_id, phase: ACTION_PHASE.ACTIVE })
}

function tick_active(
  game: Game,
  action: Action,
  entity: number,
  action_id: string,
  state: ActionState,
  ctx: ActionContext,
  elapsed: number,
  now: number
): void {
  if (!transition_phase(game, action, entity, action_id, state, ctx, elapsed, action.active_duration ?? 0, ACTION_PHASE.RECOVERY, 'active', now)) return
  
  hook.call(action, 'recovery', ctx)
  game.emit('game:action:phase_changed', { entity, action_id, phase: ACTION_PHASE.RECOVERY })
}

function tick_recovery(
  game: Game,
  action: Action,
  entity: number,
  action_id: string,
  state: ActionState,
  ctx: ActionContext,
  elapsed: number,
  now: number
): void {
  const next_phase = action.cooldown_duration && action.cooldown_duration > 0 ? ACTION_PHASE.COOLDOWN : ACTION_PHASE.IDLE
  
  if (!transition_phase(game, action, entity, action_id, state, ctx, elapsed, action.recovery_duration ?? 0, next_phase, 'recovery', now)) return
  
  if (state.phase === ACTION_PHASE.COOLDOWN) {
    hook.call(action, 'cooldown', ctx)
  }
  
  game.emit('game:action:phase_changed', { entity, action_id, phase: state.phase })
}

function tick_cooldown(
  game: Game,
  action: Action,
  entity: number,
  action_id: string,
  state: ActionState,
  ctx: ActionContext,
  elapsed: number,
  now: number
): void {
  if (!transition_phase(game, action, entity, action_id, state, ctx, elapsed, action.cooldown_duration ?? 0, ACTION_PHASE.IDLE, 'cooldown', now)) return
  
  game.emit('game:action:phase_changed', { entity, action_id, phase: ACTION_PHASE.IDLE })
}

