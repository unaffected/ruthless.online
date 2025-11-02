import { type Game, type System } from '@/game'
import * as Matter from 'matter-js'
import physics from '@/server/system/physics'
import event from '@/game/system/event'

declare module '@/game/system/event' { 
  interface Events {
    'collision:start': {
      pairs: Array<{
        entityA: number
        entityB: number
        bodyA: Matter.Body
        bodyB: Matter.Body
        collision: Matter.Collision
      }>
    }
    'collision:active': {
      pairs: Array<{
        entityA: number
        entityB: number
        bodyA: Matter.Body
        bodyB: Matter.Body
        collision: Matter.Collision
      }>
    }
    'collision:end': {
      pairs: Array<{
        entityA: number
        entityB: number
        bodyA: Matter.Body
        bodyB: Matter.Body
      }>
    }
  }
}

export const system: System = {
  id: 'server:collision' as const,
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

      game.emit('collision:start', { pairs })
    })

    Matter.Events.on(game.physics.engine, 'collisionActive', (event) => {
      const pairs = event.pairs.map((pair) => ({
        entityA: pair.bodyA.plugin?.entity as number,
        entityB: pair.bodyB.plugin?.entity as number,
        bodyA: pair.bodyA,
        bodyB: pair.bodyB,
        collision: pair.collision
      }))

      game.emit('collision:active', { pairs })
    })

    Matter.Events.on(game.physics.engine, 'collisionEnd', (event) => {
      const pairs = event.pairs.map((pair) => ({
        entityA: pair.bodyA.plugin?.entity as number,
        entityB: pair.bodyB.plugin?.entity as number,
        bodyA: pair.bodyA,
        bodyB: pair.bodyB
      }))

      game.emit('collision:end', { pairs })
    })
  }
}

export default system

