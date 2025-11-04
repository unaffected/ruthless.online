import type { Game } from '@/game'
import type { Effect } from '@/game/system/effect'
import { EFFECT_TYPE } from '@/game/component/effect'

declare module '@/game/system/effect' {
  interface Effects {
    modifier: ModifierParams
  }
}

export type ModifierParams = {
  stat: number
  operation: number
  value: number
  priority?: number
  duration?: number
  source?: number
}

export const effect: Effect<'modifier'> = {
  id: 'modifier',
  type: EFFECT_TYPE.MODIFIER,
  
  apply: (game, target, params) => {
    const entity = game.spawn()
    const now = performance.now()
    
    game.add(entity, 'effect', {
      type: EFFECT_TYPE.MODIFIER,
      target,
      applied_at: now,
      expires_at: params.duration ? now + params.duration : 0,
      source: params.source ?? target,
      stat: params.stat,
      operation: params.operation,
      value: params.value,
      priority: params.priority ?? 0
    })
    
    game.stats.invalidate(target)
    
    game.emit('game:effect:applied', { entity: target, type: EFFECT_TYPE.MODIFIER, source: params.source })
    
    console.debug(`[game:effect] applied modifier to entity #${target} (effect entity #${entity})`)
    
    return entity
  },
  
  remove: (game, effect_entity) => {
    const data = game.get(effect_entity, 'effect')
    
    if (data) {
      game.stats.invalidate(data.target)
      console.debug(`[game:effect] removed modifier effect #${effect_entity}`)
    }
  },
  
  tick: (game, delta) => {
    const now = performance.now()
    const entities = game.query([game.components.effect])
    
    for (const effect of entities) {
      const data = game.get(effect, 'effect')
      
      if (!data || data.type !== EFFECT_TYPE.MODIFIER) continue
      if (data.expires_at === 0 || now < data.expires_at) continue
      
      game.effect.remove(effect)
    }
  }
}

export default effect

