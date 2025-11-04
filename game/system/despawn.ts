import { type System } from '@/game'

declare module '@/game/system/event' { interface Events { 'game:despawned': number } }

export interface DespawnOptions { flush_rate: number }

export const system: System<DespawnOptions> = {
  id: 'game:despawn' as const,
  options: { flush_rate: 60 },
  tick: async (game, _delta, options) => {
    const entities = game.query([game.components.projectile])
    
    if (entities.length > 0) {
      const now = performance.now()
      const projectiles = game.components.projectile
      const spawned_at = projectiles.spawned_at
      const lifetime = projectiles.lifetime
      
      for (const entity of entities) {
        const idx = entity & 0xFFFFF
        const age = now - spawned_at[idx]!
        
        if (age >= lifetime[idx]!) game.despawn(entity)
      }
    }
    
    if (game.frame % options.flush_rate !== 0) return

    game.flush()
  }
}

export default system
