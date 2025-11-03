import { type System } from '@/game'
import event from '@/game/system/event'
import collision from '@/game/system/collision'
import handlers from '@/game/combat'

declare module '@/game/system/event' {
  interface Events {
    'game:combat:damage': {
      attacker: number
      target: number
      damage: number
      new_health: number
      source: string
    }
    'game:combat:kill': {
      attacker: number
      target: number
      source: string
    }
  }
}

declare module '@/game' {
  interface Game {
    combat: {
      handlers: Map<string, HitHandler>
      apply_damage: (attacker: number, target: number, damage: number, source?: string) => boolean
    }
  }
}

export type HitHandler<K extends HIT_HANDLER = HIT_HANDLER> = {
  id: K
  check: (game: any, entityA: number, entityB: number) => boolean
  execute: (game: any, entityA: number, entityB: number) => void
}

export type HIT_HANDLER = keyof HitHandlers

export interface HitHandlers {}

export const system: System = {
  id: 'game:combat' as const,
  dependencies: [event, collision],
  install: async (game) => {
    game.combat = {
      handlers: new Map(),
      
      apply_damage: (attacker, target, damage, source) => {
        if (typeof game.server === 'undefined') return false
        
        const health = game.get(target, 'health')
        
        if (!health) return false
        
        const new_health = Math.max(0, health.current - damage)
        
        game.set(target, 'health', { current: new_health })
        
        game.emit('game:combat:damage', {
          attacker,
          target,
          damage,
          new_health,
          source: source ?? 'unknown'
        })
        
        if (new_health <= 0) {
          game.despawn(target)
          
          game.emit('game:combat:kill', {
            attacker,
            target,
            source: source ?? 'unknown'
          })
        }
        
        return true
      }
    }
    
    handlers.forEach((handler) => {
      game.combat.handlers.set(handler.id, handler as HitHandler)
    })
    
    game.on('game:collision:start', (pairs) => {
      if (pairs.length === 0) return
      
      const handlers = Array.from(game.combat.handlers.values())
      
      if (handlers.length === 0) return
      
      for (const { entityA, entityB } of pairs) {
        for (const handler of handlers) {
          if (handler.check(game, entityA, entityB)) {
            handler.execute(game, entityA, entityB)
            continue
          }
          
          if (handler.check(game, entityB, entityA)) {
            handler.execute(game, entityB, entityA)
          }
        }
      }
    })
  }
}

export default system
