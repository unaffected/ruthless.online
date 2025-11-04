import type { HitHandler } from '@/game/system/combat'
import type { Game } from '@/game'

declare module '@/game/system/combat' {
  interface HitHandlers {
    projectile: never
  }
}

export const handler: HitHandler<'projectile'> = {
  id: 'projectile',
  check: (game: Game, source: number, target: number) => {
    const projectile = game.get(source, 'projectile')
    
    if (!projectile) return false
    
    if (projectile.owner === target) return false
    
    const stats = game.get(target, 'stats')
    
    return stats !== undefined
  },
  execute: (game: Game, source: number, target: number) => {
    const projectile = game.get(source, 'projectile')
    
    if (!projectile) return
    
    game.despawn(source)
    
    game.combat.apply_damage(projectile.owner, target, projectile.damage)
  }
}

export default handler

