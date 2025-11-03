import type { Root } from 'react-dom/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Canvas from '@/client/canvas'
import { type System } from '@/game'

declare module '@/game' { interface Game { canvas: Root } }

export const system: System = {
  id: 'client:render' as const,
  install: async (game, options) => {    
    if (import.meta.hot) {
      import.meta.hot.data.root ??= createRoot(window.document.getElementById('hud')!)
      game.canvas ??= import.meta.hot.data.root
    } else {
      game.canvas ??= createRoot(window.document.getElementById('hud')!)
    }

    game.canvas.render((<StrictMode><Canvas /></StrictMode>))
  },
}

export default system