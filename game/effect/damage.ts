import type { Game } from '@/game'
import type { Effect } from '@/game/system/effect'
import { EFFECT_TYPE } from '@/game/component/effect'

declare module '@/game/system/effect' {
  interface Effects {
    damage: DamageParams
  }
}

export type DamageParams = {
  value: number
  source?: number
}

export const effect: Effect<'damage'> = {
  id: 'damage',
  type: EFFECT_TYPE.DAMAGE,
  
  apply: (game, target, params) => {
    if (typeof game.server === 'undefined') return 0
    
    const stats = game.get(target, 'stats')
    
    if (!stats) return 0
    
    const damage = params.value
    const new_health = Math.max(0, stats.health_current - damage)
    
    game.set(target, 'stats', { health_current: new_health })
    
    game.emit('game:combat:damage', {
      attacker: params.source ?? 0,
      target,
      damage,
      new_health,
      source: 'effect'
    })
    
    if (new_health <= 0) {
      game.despawn(target)
      
      game.emit('game:combat:kill', {
        attacker: params.source ?? 0,
        target,
        source: 'effect'
      })
    }
    
    console.debug(`[game:effect] applied ${damage} damage to entity #${target} (new health: ${new_health})`)
    
    return 0
  }
}

export default effect

