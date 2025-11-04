import type { Game, System } from '@/game'
import type { HitHandler, HIT_HANDLER } from '@/game/config/combat'
import event from '@/game/system/event'
import collision from '@/game/system/collision'
import handlers from '@/game/combat'

export { type HitHandler, type HIT_HANDLER, type HitHandlers } from '@/game/config/combat'

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
      apply_damage: (attacker: number, target: number, damage: number) => void
    }
  }
}

export const system: System = {
  id: 'game:combat' as const,
  dependencies: [event, collision],
  install: async (game) => {
    game.combat = {
      handlers: new Map(),
      
      apply_damage: (attacker, target, damage) => {
        game.effect.apply('damage', target, {
          source: attacker,
          value: damage
        })
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
