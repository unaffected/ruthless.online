import type { Root } from 'react-dom/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HUD from '@/client/hud'
import { type System } from '@/game'

declare module '@/game' { 
  interface Game {
    hud: Root
  }
}

export const system: System = {
  id: 'client:render' as const,
  install: async (game, options) => {    
    if (import.meta.hot) {
      import.meta.hot.data.root ??= createRoot(window.document.getElementById('hud')!)
      game.hud ??= import.meta.hot.data.root
    } else {
      game.hud ??= createRoot(window.document.getElementById('hud')!)
    }

    game.hud.render((<StrictMode><HUD /></StrictMode>))

    console.debug('[client:render] initialized')
  },
}

export default system