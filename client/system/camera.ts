import type { ObservablePoint } from 'pixi.js'
import player from '@/client/system/player'
import { type System } from '@/game'

declare module '@/game' { 
  interface Game {
    camera: {
      x: number, y: number,
      center: () => ObservablePoint,
    }
  }
}

export const system: System = {
  id: 'client:camera' as const,
  dependencies: [player],
  install: async (game) => {
    game.camera = {
      x: 0, y: 0,
      center: () => game.scene.stage.position.set(
        window.innerWidth / 2 - game.camera.x,
        window.innerHeight / 2 - game.camera.y,
      ),
    }

    console.debug('[client:camera] initialized')
  },
  tick: async (game) => {
    const player = game.get(game.entity, 'player')!

    if (!player) return

    game.camera.x = player.position_x
    game.camera.y = player.position_y

    game.camera.center()
  },
}

export default system