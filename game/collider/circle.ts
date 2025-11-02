import type { Game } from '@/game'
import { type Collider, SHAPE } from '@/game/system/collider'
import * as Matter from 'matter-js'

declare module '@/game/system/collider' { 
  interface Colliders { 
    circle: CircleCollider 
  } 
}

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
    const player = game.get(entity, 'player')
    
    if (!player) return 

    Matter.Body.setPosition(body, {
      x: player.position_x,
      y: player.position_y
    })
  }
}

export default collider

