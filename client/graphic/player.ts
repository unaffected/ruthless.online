import type { Game } from '@/game'
import type { Graphic } from '@/client/system/graphic'
import { Graphics } from 'pixi.js'

declare module '@/client/system/graphic' { interface Graphics { player: PlayerGraphic } }

export type PlayerGraphic = { color?: number }

export const graphic: Graphic<'player'> = {
  id: 'player',
  spawn: (game: Game, entity: number, options) => {
    const color = options?.color ?? game.is_local_player(entity) ? 0xB4A1FF : 0xFFA1FF
    
    const graphics = new Graphics()
      .circle(24, 24, 24)
      .fill({ color })
      .stroke({ width: 4, color: 0xD6A4A1 })

    graphics.pivot.set(graphics.width / 2, graphics.height / 2)
    graphics.origin.set(graphics.width / 2, graphics.height / 2)

    if (game.is_local_player(entity)) {
      graphics.position.set(window.innerWidth / 2, window.innerHeight / 2)
    }

    game.scene.stage.addChild(graphics)

    return graphics
  },
  despawn: (game: Game, entity: number, graphic) => {
    game.scene.stage.removeChild(graphic)
  },
  tick: (game: Game, entity: number, graphic) => {
    const position = game.get(entity, 'position')
    
    if (!position) return
    
    const state = game.interpolation?.states.get(entity)
    
    const x = state ? state.current_x : position.x
    const y = state ? state.current_y : position.y
    
    if (graphic.x !== x || graphic.y !== y) {
      graphic.position.set(x, y)
    }
  }
}

export default graphic
