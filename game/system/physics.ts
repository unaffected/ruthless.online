import { type System } from '@/game'
import Matter from 'matter-js'

declare module '@/game' { interface Game { physics: { engine: Matter.Engine } } }

export interface PhysicsOptions {
  flush_rate: number
  burst_substeps: number
  engine: Matter.IEngineDefinition
}

export const system: System<PhysicsOptions> = {
  id: 'game:physics' as const,
  framerate: 120,
  dependencies: [],
  options: {
    flush_rate: 300,
    burst_substeps: 4,
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
    
    const burst_entities = new Set<number>()
    const normal_bodies: Matter.Body[] = []
    
    for (const body of world.bodies) {
      const entity = body.plugin.entity as number
      if (body.isStatic) continue
      
      if (game.has(entity, 'burst')) {
        burst_entities.add(entity)
      } else if (game.has(entity, 'velocity')) {
        normal_bodies.push(body)
      }
    }
    
    for (const body of normal_bodies) {
      const entity = body.plugin.entity as number
      const velocity = game.get(entity, 'velocity')
      if (!velocity) continue
      Matter.Body.setVelocity(body, { x: velocity.x, y: velocity.y })
    }
    
    if (burst_entities.size > 0) {
      const substep_delta = delta / options.burst_substeps
      
      for (let step = 0; step < options.burst_substeps; step++) {
        for (const entity of burst_entities) {
          const body = game.collider.bodies.get(entity)
          if (!body) continue
          
          const velocity = game.get(entity, 'velocity')
          if (!velocity) continue
          
          Matter.Body.setVelocity(body, { x: velocity.x, y: velocity.y })
        }
        
        Matter.Engine.update(game.physics.engine, substep_delta)
      }
    } else {
      Matter.Engine.update(game.physics.engine, delta)
    }
    
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

