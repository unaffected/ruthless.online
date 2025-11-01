import { type System } from '@/game'
import graphic from '@/client/system/graphic'

export const system: System = {
  id: 'client:scene' as const,
  dependencies: [graphic],
  install: async (game) => {
    console.debug('[client:scene] initialized')
  },
  tick: async (game) => {
    const players = game.query([game.components.player])

    for (const entity of players) {
      if (!game.graphics.has(entity)) {
        game.graphic.spawn('player', entity)
      }
    }

    for (const [entity] of game.graphics) {
      if (!players.includes(entity)) {
        game.graphic.despawn(entity)
      }
    }

    game.graphic.tick()
  }
}

export default system
