import type { Game } from '@/game'
import type { Collider } from '@/game/system/collider'
import { SHAPE } from '@/game/component/collider'
import Matter from 'matter-js'

declare module '@/game/system/collider' { interface Colliders { box: BoxCollider } }

export type BoxCollider = {
  width: number
  height: number
  x?: number
  y?: number
  options?: Matter.IChamferableBodyDefinition
}

export const collider: Collider<'box'> = {
  id: 'box',
  type: SHAPE.BOX,
  spawn: (game, entity, options) => {
    const { width, height, x = 0, y = 0, options: bodyOptions } = options
    
    const body = Matter.Bodies.rectangle(
      x,
      y,
      width,
      height,
      bodyOptions
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

