import { type System } from '@/game'
import controller from '@/client/system/controller'

export const system: System = {
  id: 'client:input' as const,
  dependencies: [controller],
  install: async (game) => {
    game.on('client:controller:tick', () => {
      if (typeof game.entity !== 'number') return

      game.action('move', game.entity, game.input.state)
      
      if (game.input.state.ACTION_1) {
        game.action('shoot', game.entity, game.input.state)
      }
    })
  }
}

export default system

