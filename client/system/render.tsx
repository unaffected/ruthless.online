import type { ApplicationOptions } from 'pixi.js'
import type { Root } from 'react-dom/client'
import { Application } from 'pixi.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HUD from '@/client/hud'
import { type System } from '@/game'

declare module '@/game' { 
  interface Game {
    hud: Root
    scene: Application
  }
}

export type Options = ApplicationOptions

export const system: System<Options> = {
  id: 'client:render' as const,
  install: async (game, options) => {    
    if (import.meta.hot) {
      import.meta.hot.data.root ??= createRoot(window.document.getElementById('hud')!)
      game.hud ??= import.meta.hot.data.root
    } else {
      game.hud ??= createRoot(window.document.getElementById('hud')!)
    }

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

    game.hud.render((<StrictMode><HUD /></StrictMode>))

    window.document.body.appendChild(game.scene.canvas)

    console.debug('[client:render] initialized')
  },
}

export default system