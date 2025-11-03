import { type Game, type System } from '@/game'
import Matter from 'matter-js'
import event from '@/game/system/event'
import physics from '@/game/system/physics'

declare module '@/game/system/event' { 
  interface Events {
    'game:collision:start': Array<{
      entityA: number
      entityB: number
      bodyA: Matter.Body
      bodyB: Matter.Body
      collision: Matter.Collision
    }>

    'game:collision:active': Array<{
      entityA: number
      entityB: number
      bodyA: Matter.Body
      bodyB: Matter.Body
      collision: Matter.Collision
    }>

    'game:collision:end': Array<{
      entityA: number
      entityB: number
      bodyA: Matter.Body
      bodyB: Matter.Body
    }>
  }
}

export const system: System = {
  id: 'game:collision' as const,
  dependencies: [physics, event],
  install: async (game) => {
    Matter.Events.on(game.physics.engine, 'collisionStart', (event) => {
      const pairs = event.pairs.map((pair) => ({
        entityA: pair.bodyA.plugin?.entity as number,
        entityB: pair.bodyB.plugin?.entity as number,
        bodyA: pair.bodyA,
        bodyB: pair.bodyB,
        collision: pair.collision
      }))
      
      game.emit('game:collision:start', pairs)
    })

    Matter.Events.on(game.physics.engine, 'collisionActive', (event) => {
      game.emit('game:collision:active', event.pairs.map((pair) => ({
        entityA: pair.bodyA.plugin?.entity as number,
        entityB: pair.bodyB.plugin?.entity as number,
        bodyA: pair.bodyA,
        bodyB: pair.bodyB,
        collision: pair.collision
      })))
    })

    Matter.Events.on(game.physics.engine, 'collisionEnd', (event) => {
      game.emit('game:collision:end', event.pairs.map((pair) => ({
        entityA: pair.bodyA.plugin?.entity as number,
        entityB: pair.bodyB.plugin?.entity as number,
        bodyA: pair.bodyA,
        bodyB: pair.bodyB
      })))
    })
  }
}

export default system

