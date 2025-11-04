import { type System } from '@/game'
import controller from '@/client/system/controller'

export const system: System = {
  id: 'client:input' as const,
  dependencies: [controller],
  install: async (game) => {
    game.on('client:controller:tick', () => {
      if (typeof game.entity !== 'number') return

      const has_movement = false 
        || game.input.state.UP 
        || game.input.state.DOWN 
        || game.input.state.LEFT 
        || game.input.state.RIGHT
      
      if (has_movement) {
        game.action.activate('move', game.entity, game.input.state)
      } 
      
      if (!has_movement) {
        const move_state = game.action.state('move', game.entity)

        if (move_state && move_state.phase !== 0) {
          game.action.cancel('move', game.entity)
        }
      }
      
      if (game.input.state.ACTION_3 && has_movement) {
        game.action.activate('sprint', game.entity, game.input.state)
      } else {
        const sprint_state = game.action.state('sprint', game.entity)
        
        if (sprint_state && sprint_state.phase !== 0) {
          game.action.cancel('sprint', game.entity)
        }
      }
      
      if (game.input.state.ACTION_1) {
        game.action.activate('shoot', game.entity, game.input.state)
      }
      
      if (game.input.state.ACTION_2) {
        game.action.activate('dash', game.entity, game.input.state)
      }
    })
  }
}

export default system

