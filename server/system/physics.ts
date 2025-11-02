import { type System } from '@/game'
import Matter from 'matter-js'

declare module '@/game' { interface Game { physics: { engine: Matter.Engine } } }

export interface PhysicsOptions {
  flush_rate: number
  engine: Matter.IEngineDefinition
}

export const system: System<PhysicsOptions> = {
  id: 'server:physics' as const,
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
    
    Matter.Engine.update(game.physics.engine, delta)

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

