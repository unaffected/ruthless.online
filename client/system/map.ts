import { type System } from '@/game'
import scene from '@/client/system/scene'
import { Graphics } from 'pixi.js'

declare module '@/game' { 
  interface Game {
    map: {
      container: Graphics,
      width: number
      height: number
      grid: number
    }
  }
}

export const system: System = {
  id: 'client:map' as const,
  dependencies: [scene],
  install: async (game) => {
    game.map = {
      container: new Graphics(),
      width: 2880,
      height: 1620,
      grid: 100
    }

    game.map.container.label = 'map'
    game.map.container.rect(-10000, -10000, 20000, 20000)
    game.map.container.fill(0x000000)
    
    game.map.container.rect(
      -game.map.width / 2,
      -game.map.height / 2,
      game.map.width,
      game.map.height,
    )
    game.map.container.fill(0x1a1a2e)
    
    game.map.container.setStrokeStyle({ width: 2, color: 0x444444, alpha: 0.5 })
    
    for (let x = -game.map.width / 2; x <= game.map.width / 2; x += game.map.grid) {
      game.map.container.moveTo(x, -game.map.height / 2)
      game.map.container.lineTo(x, game.map.height / 2)
    }
    
    for (let y = -game.map.height / 2; y <= game.map.height / 2; y += game.map.grid) {
      game.map.container.moveTo(-game.map.width / 2, y)
      game.map.container.lineTo(game.map.width / 2, y)
    }
    
    game.map.container.stroke()
    
    game.map.container.rect(
      -game.map.width / 2,
      -game.map.height / 2,
      game.map.width,
      game.map.height
    )
    
    game.map.container.stroke({ color: 0xff0000, width: 6, alpha: 1 })
    
    const group = game.scene.stage.children.find(c => c.label === 'dynamic')

    if (group) {
      group.addChildAt(game.map.container, 0)
    } else {
      game.scene.stage.addChildAt(game.map.container, 0)
    }
  },
}

export default system