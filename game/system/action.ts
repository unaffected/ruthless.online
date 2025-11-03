import { type Game, type System } from '@/game'
import actions from '@/game/action'
import event from '@/game/system/event'

export type ACTION = keyof Actions

export type Action<K extends ACTION = ACTION> = {
  id: K
  cooldown?: number
  energy_cost?: number
  execute: (game: Game, entity: number, params: Actions[K]) => void
}

export interface Actions {}

declare module '@/game' { 
  interface Game {
    actions: Map<string, Action>
    cooldowns: Map<number, Map<string, number>>
    action: <K extends keyof Actions>(id: K, entity: number, params: Actions[K]) => boolean
  }
}

export const system: System = {
  id: 'game:action' as const,
  dependencies: [event],
  install: async (game) => {
    game.actions = new Map()
    game.cooldowns = new Map()

    game.action = (id, entity, params) => {
      const action = game.actions.get(id)
      
      if (!action) {
        console.warn(`[action] Action '${id}' not found`)
        return false
      }
      
      const now = performance.now()
      
      if (action.cooldown !== undefined) {
        let entity_cooldowns = game.cooldowns.get(entity)
        
        if (!entity_cooldowns) {
          entity_cooldowns = new Map()
          game.cooldowns.set(entity, entity_cooldowns)
        }
        
        const last_used = entity_cooldowns.get(id) ?? 0
        const elapsed = now - last_used
        
        if (elapsed < action.cooldown) {
          return false
        }
      }
      
      if (action.energy_cost !== undefined) {
        const energy = game.get(entity, 'energy')
        
        if (!energy || energy.current < action.energy_cost) {
          return false
        }
        
        game.set(entity, 'energy', { current: energy.current - action.energy_cost })
      }
      
      action.execute(game, entity, params)
      
      if (action.cooldown !== undefined) {
        const entity_cooldowns = game.cooldowns.get(entity)!
        entity_cooldowns.set(id, now)
      }
      
      return true
    }

    actions.forEach((action) => { game.actions.set(action.id, action as Action) })
  }
}

export default system
