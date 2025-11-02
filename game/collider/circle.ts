import type { Game } from '@/game'
import type { Collider } from '@/game/system/collider'
import { SHAPE } from '@/game/component/collider'
import Matter from 'matter-js'

declare module '@/game/system/collider' { interface Colliders { circle: CircleCollider } }

export type CircleCollider = {
  radius: number
  x?: number
  y?: number
  options?: Matter.IBodyDefinition
}

export const collider: Collider<'circle'> = {
  id: 'circle',
  type: SHAPE.CIRCLE,
  spawn: (game: Game, entity: number, options) => {
    const body = Matter.Bodies.circle(
      options.x ?? 0,
      options.y ?? 0,
      options.radius,
      options.options ?? undefined
    )
    
    body.plugin = { entity }
    
    Matter.Composite.add(game.physics.engine.world, body)

    return body
  },
  despawn: (game: Game, entity: number, body) => {
    Matter.Composite.remove(game.physics.engine.world, body)
  },
  tick: (game, entity, body) => {
    const position = game.get(entity, 'position')
    
    if (!position) return 

    Matter.Body.setPosition(body, {
      x: position.x,
      y: position.y
    })
  }
}

export default collider

