import type { Game, System } from '@/game'
import stat from '@/game/system/stat'
import event from '@/game/system/event'
import effects from '@/game/effect'

declare module '@/game' {
  interface Game {
    effect: {
      registry: Map<EFFECT, Effect>
      ownership: Map<number, string>
      apply: <K extends EFFECT>(type: K, target: number, params: Effects[K], owner?: string) => number
      remove: (effect_entity: number) => void
      remove_owned: (entity: number, owner: string) => void
      tick: (delta: number) => void
    }
  }
}

declare module '@/game/system/event' {
  interface Events {
    'game:effect:applied': { entity: number, type: number, source?: number }
    'game:effect:removed': { entity: number, type: number }
  }
}

export type EFFECT = keyof Effects

export interface Effects {}

export type Effect<K extends EFFECT = EFFECT> = {
  id: K
  type: number
  apply: (game: Game, target: number, params: Effects[K]) => number
  remove?: (game: Game, effect_entity: number) => void
  tick?: (game: Game, delta: number) => void
}

export const system: System = {
  id: 'game:effect',
  dependencies: [stat, event],
  
  install: async (game) => {
    game.effect = {
      registry: new Map(),
      ownership: new Map(),
      
      apply: (type, target, params, owner) => {
        const effect = game.effect.registry.get(type)
        
        if (!effect) {
          console.warn(`[game:effect] effect '${type}' not found`)
          
          return 0
        }
        
        const effect_entity = effect.apply(game, target, params)
        
        if (owner && effect_entity !== 0) {
          game.effect.ownership.set(effect_entity, owner)
        }
        
        return effect_entity
      },
      
      remove: (effect_entity) => {
        const data = game.get(effect_entity, 'effect')
        
        if (!data) return
        
        const type_name = get_effect_name(data.type)
        
        if (!type_name) return
        
        const effect = game.effect.registry.get(type_name)
        
        effect?.remove?.(game, effect_entity)
        
        game.despawn(effect_entity)
        game.effect.ownership.delete(effect_entity)
        
        game.emit('game:effect:removed', { entity: data.target, type: data.type })
      },
      
      remove_owned: (entity, owner) => {
        const entities = game.query([game.components.effect])
        
        for (const effect_entity of entities) {
          const data = game.get(effect_entity, 'effect')
          
          if (!data || data.target !== entity) continue
          if (game.effect.ownership.get(effect_entity) !== owner) continue
          
          game.effect.remove(effect_entity)
        }
      },
      
      tick: (delta) => {
        for (const effect of game.effect.registry.values()) {
          effect.tick?.(game, delta)
        }
      }
    }
    
    effects.forEach(effect => game.effect.registry.set(effect.id, effect as Effect))
  },
  
  tick: async (game, delta) => {
    game.effect.tick(delta)
  }
}

function get_effect_name(type: number): EFFECT | undefined {
  const effects = ['modifier', 'damage', 'dot', 'hot'] as const
  return effects[type] as EFFECT | undefined
}

export default system
