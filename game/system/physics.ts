import { type System } from '@/game'
import Matter from 'matter-js'

declare module '@/game' { interface Game { physics: { engine: Matter.Engine } } }

export interface PhysicsOptions {
  flush_rate: number
  engine: Matter.IEngineDefinition
}

export const system: System<PhysicsOptions> = {
  id: 'game:physics' as const,
  dependencies: [],
  options: {
    flush_rate: 300, 
    engine: {
      gravity: { x: 0, y: 0 }
    }
  },
  install: async (game, options) => {
    game.physics = { engine: Matter.Engine.create(options.engine) } 
  },
  tick: async (game, delta, options) => {
    const world = game.physics.engine.world
    
    if (world.bodies.length === 0) return
    
    for (const body of world.bodies) {
      const entity = body.plugin.entity as number
      
      if (body.isStatic) continue
      if (!game.has(entity, 'velocity')) continue
      
      const velocity = game.get(entity, 'velocity')

      if (!velocity) continue 

      Matter.Body.setVelocity(body, { x: velocity.x, y: velocity.y })
    }
    
    Matter.Engine.update(game.physics.engine, delta)
    
    const positions = game.components.position
    const pos_x = positions.x
    const pos_y = positions.y
    
    for (const body of world.bodies) {
      const entity = body.plugin.entity as number
      
      if (body.isStatic) continue
      if (!game.has(entity, 'position')) continue
      
      const idx = entity & 0xFFFFF
      pos_x[idx] = body.position.x
      pos_y[idx] = body.position.y
    }
 
    if (game.frame % options.flush_rate !== 0) return
    
    const bodies: Matter.Body[] = []
    
    for (const body of world.bodies) {
      const entity = body.plugin.entity as number
      
      if (game.has(entity, 'collider')) continue
        
      bodies.push(body)
    }
    
    if (bodies.length === 0) return

    Matter.Composite.remove(world, bodies)
  },
}

export default system

