import { Application, type ApplicationOptions } from 'pixi.js'
import { type System } from '@/game'
import graphic from '@/client/system/graphic'
import canvas from '@/client/system/canvas'

declare module '@/game' { interface Game { scene: Application }  }

export const system: System<ApplicationOptions> = {
  id: 'client:scene' as const,
  dependencies: [graphic, canvas],
  install: async (game, options) => {
    game.scene ??= new Application()

    game.start = () => { game.scene.start() }
    game.stop = () => { game.scene.stop() }

    await game.scene.init({
      antialias: options?.antialias ?? false,
      autoDensity: options?.autoDensity ?? true,
      autoStart: options?.autoStart ?? false,
      backgroundColor: 0x101010,
      height: window.innerHeight,
      preference: options?.preference ?? 'webgl',
      powerPreference: options?.powerPreference ?? 'high-performance',
      resolution: options?.resolution ?? window.devicePixelRatio ?? 1,
      resizeTo: options?.resizeTo ?? window,
      sharedTicker: options?.sharedTicker ?? true,
      width: window.innerWidth,
    })

    game.scene.ticker.minFPS = game.option('framerate', 30)
    game.scene.ticker.maxFPS = game.option('framerate', 60)

    game.scene.ticker.add((ticker) => { game.tick(ticker.deltaMS) })

    game.scene.canvas.style.position = 'absolute'
    game.scene.canvas.style.top = '0'
    game.scene.canvas.style.left = '0'
    game.scene.canvas.style.zIndex = '1'

    window.document.body.appendChild(game.scene.canvas)
  },
  tick: async (game) => {
    const entities = game.query([game.components.position])

    for (const entity of entities) {
      if (game.graphics.has(entity)) continue

      if (game.has(entity, 'projectile')) {
        game.graphic.spawn('projectile', entity)
      } else {
        game.graphic.spawn('player', entity)
      }
    }

    for (const [entity] of game.graphics) {
      if (entities.includes(entity)) continue
      
      game.graphic.despawn(entity)
    }

    game.graphic.tick()
  }
}

export default system
