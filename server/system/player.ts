import { type System } from '@/game'
import network from '@/server/system/network'
import collider from '@/game/system/collider'

export const system: System = {
  id: 'server:player' as const,
  dependencies: [network, collider],
  install: async (game) => {
  game.on('server:player:connected', (connection) => {
    const entity = game.connections.get(connection)!
    
    game.add(entity, 'sync')
    game.add(entity, 'input', { packed: 0, sequence: 0 })
    game.add(entity, 'position', { x: 50.0, y: 25.0 })
    game.add(entity, 'velocity', { x: 0.0, y: 0.0 })
    game.add(entity, 'rotation', { value: 0.0 })
    game.add(entity, 'health', { current: 100.0, maximum: 100.0 })
    game.add(entity, 'movement', { speed: 6.0 })
    
    game.collider.spawn('circle', entity, {
      radius: 20,
      options: {
        collisionFilter: game.config.collision.COLLISION_FILTER.PLAYER,
        isStatic: false,
        isSleeping: false,
        sleepThreshold: Infinity,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        restitution: 0,
        inertia: Infinity,
      }
    })
  })
  },
}

export default system