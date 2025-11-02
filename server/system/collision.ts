import { type Game, type System } from '@/game'
import Matter from 'matter-js'
import physics from '@/server/system/physics'
import event from '@/game/system/event'

declare module '@/game/system/event' { 
  interface Events {
    'collision:start': Array<{
      entityA: number
      entityB: number
      bodyA: Matter.Body
      bodyB: Matter.Body
      collision: Matter.Collision
    }>

    'collision:active': Array<{
      entityA: number
      entityB: number
      bodyA: Matter.Body
      bodyB: Matter.Body
      collision: Matter.Collision
    }>

    'collision:end': Array<{
      entityA: number
      entityB: number
      bodyA: Matter.Body
      bodyB: Matter.Body
    }>
  }
}

export const system: System = {
  id: 'server:collision' as const,
  dependencies: [physics, event],
  install: async (game) => {
    Matter.Events.on(game.physics.engine, 'collisionStart', (event) => {
      game.emit('collision:start', event.pairs.map((pair) => ({
        entityA: pair.bodyA.plugin?.entity as number,
        entityB: pair.bodyB.plugin?.entity as number,
        bodyA: pair.bodyA,
        bodyB: pair.bodyB,
        collision: pair.collision
      })))
    })

    Matter.Events.on(game.physics.engine, 'collisionActive', (event) => {
      game.emit('collision:active', event.pairs.map((pair) => ({
        entityA: pair.bodyA.plugin?.entity as number,
        entityB: pair.bodyB.plugin?.entity as number,
        bodyA: pair.bodyA,
        bodyB: pair.bodyB,
        collision: pair.collision
      })))
    })

    Matter.Events.on(game.physics.engine, 'collisionEnd', (event) => {
      game.emit('collision:end', event.pairs.map((pair) => ({
        entityA: pair.bodyA.plugin?.entity as number,
        entityB: pair.bodyB.plugin?.entity as number,
        bodyA: pair.bodyA,
        bodyB: pair.bodyB
      })))
    })
  }
}

export default system

