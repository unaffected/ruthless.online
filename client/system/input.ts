import { type System } from '@/game'
import controller from '@/client/system/controller'

export const system: System = {
  id: 'client:input' as const,
  dependencies: [controller],
  install: async (game) => {
    game.on('client:controller:tick', () => {
      if (!game.entity) return

      game.action('move', game.entity, game.input.state)
    })
  }
}

export default system

