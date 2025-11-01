import type { ObservablePoint } from 'pixi.js'
import canvas from '@/client/system/canvas'
import player from '@/client/system/player'
import { type System } from '@/game'

declare module '@/game' { 
  interface Game {
    camera: {
      x: number
      y: number
      target_x: number
      target_y: number
      speed: number
      snap_threshold: number
      center: () => ObservablePoint
    }
  }
}

export const system: System = {
  id: 'client:camera' as const,
  dependencies: [canvas, player],
  install: async (game) => {
    game.camera = {
      x: 0, 
      y: 0,
      target_x: 0,
      target_y: 0,
      speed: game.option('camera_speed', 0.2),
      snap_threshold: game.option('camera_snap_threshold', 0.5),
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

    game.camera.target_x = player.position_x
    game.camera.target_y = player.position_y

    const dx = game.camera.target_x - game.camera.x
    const dy = game.camera.target_y - game.camera.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < game.camera.snap_threshold) {
      game.camera.x = game.camera.target_x
      game.camera.y = game.camera.target_y
    } else {
      game.camera.x += dx * game.camera.speed
      game.camera.y += dy * game.camera.speed
    }

    game.camera.center()
  },
}

export default system