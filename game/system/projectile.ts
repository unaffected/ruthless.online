import { type System } from '@/game'
import collider from '@/game/system/collider'

export const system: System = {
  id: 'game:projectile' as const,
  dependencies: [collider],
  tick: async (game) => {
    const entities = game.query([game.components.projectile])
    
    if (entities.length === 0) return
    
    const now = performance.now()
    
    for (const entity of entities) {
      const projectile = game.get(entity, 'projectile')
      
      if (!projectile) continue
      
      if (game.collider.bodies.has(entity)) continue
      
      const position = game.get(entity, 'position')

      if (!position) continue
      
      game.collider.spawn('circle', entity, {
        radius: 5,
        x: position.x,
        y: position.y,
        options: {
          isSensor: true,
          isStatic: false,
        }
      })
      
      const age = now - projectile.spawned_at
      
      if (age >= projectile.lifetime) game.despawn(entity)
    }
  }
}

export default system

