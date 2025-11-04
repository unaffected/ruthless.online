import type { Game } from '@/game'
import type { Effect } from '@/game/system/effect'
import { EFFECT_TYPE } from '@/game/component/effect'

declare module '@/game/system/effect' {
  interface Effects {
    dot: DotParams
  }
}

export type DotParams = {
  value: number
  duration: number
  source?: number
  interval?: number
}

export const effect: Effect<'dot'> = {
  id: 'dot',
  type: EFFECT_TYPE.DAMAGE_OVER_TIME,
  
  apply: (game, target, params) => {
    const entity = game.spawn()
    const now = performance.now()
    
    game.add(entity, 'effect', {
      type: EFFECT_TYPE.DAMAGE_OVER_TIME,
      target,
      applied_at: now,
      expires_at: now + params.duration,
      source: params.source ?? target,
      stat: 0,
      operation: 0,
      value: params.value,
      priority: 0
    })
    
    game.emit('game:effect:applied', { entity: target, type: EFFECT_TYPE.DAMAGE_OVER_TIME, source: params.source })
    
    console.debug(`[game:effect] applied DOT to entity #${target} (effect entity #${entity})`)
    
    return entity
  },
  
  remove: (game, effect_entity) => {
    console.debug(`[game:effect] removed DOT effect #${effect_entity}`)
  },
  
  tick: (game, delta) => {
    if (typeof game.server === 'undefined') return
    
    const now = performance.now()
    const entities = game.query([game.components.effect])
    const seconds = delta / 1000
    
    for (const effect of entities) {
      const data = game.get(effect, 'effect')
      
      if (!data || data.type !== EFFECT_TYPE.DAMAGE_OVER_TIME) continue
      
      if (now >= data.expires_at) {
        game.effect.remove(effect)

        continue
      }
      
      const stats = game.get(data.target, 'stats')
      
      if (!stats) continue
      
      const damage = data.value * seconds
      const health = Math.max(0, stats.health_current - damage)
      
      game.set(data.target, 'stats', { health_current: health })
      
      if (health <= 0) {
        game.despawn(data.target)
        game.effect.remove(effect)
      }
    }
  }
}

export default effect

