import type { Game } from '@/game'
import type { Graphic } from '@/client/system/graphic'
import { Graphics } from 'pixi.js'

declare module '@/client/system/graphic' { interface Graphics { projectile: ProjectileGraphic } }

export type ProjectileGraphic = { color?: number }

export const graphic: Graphic<'projectile'> = {
  id: 'projectile',
  spawn: (game: Game, entity: number, options) => {
    const color = options?.color ?? 0xFFFF00
    
    const graphics = new Graphics()
      .circle(8, 8, 8)
      .fill({ color })
      .stroke({ width: 2, color: 0xFFFFFF })

    graphics.pivot.set(graphics.width / 2, graphics.height / 2)
    graphics.origin.set(graphics.width / 2, graphics.height / 2)

    game.scene.stage.addChild(graphics)

    return graphics
  },
  despawn: (game: Game, entity: number, graphic) => {
    game.scene.stage.removeChild(graphic)
  },
  tick: (game: Game, entity: number, graphic) => {
    const position = game.get(entity, 'position')
    
    if (!position) return
    
    if (graphic.x !== position.x || graphic.y !== position.y) {
      graphic.position.set(position.x, position.y)
    }
  }
}

export default graphic

