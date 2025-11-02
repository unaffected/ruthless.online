import { type System } from '@/game'
import * as config from '@/game/config'

declare module '@/game' { 
  interface Game {
    config: typeof config
  }
}

export const system: System = {
  id: 'game:config' as const,
  dependencies: [],
  install: async (game) => {
    game.config = config
  },
}

export default system

