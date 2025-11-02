import type { Action } from '@/game/system/action'
import type { State } from '@/game/utility/input'

declare module '@/game/system/action' { interface Actions { move: MoveAction } }

export type MoveAction = State

export const action: Action<'move'> = {
  id: 'move',
  execute: (game, entity, params) => {
    const player = game.get(entity, 'player')
    
    if (!player) return
        
    let velocity_x = 0
    let velocity_y = 0
    
    if (params.LEFT) velocity_x -= 1
    if (params.RIGHT) velocity_x += 1
    if (params.UP) velocity_y -= 1
    if (params.DOWN) velocity_y += 1
    
    if (velocity_x !== 0 && velocity_y !== 0) {
      const magnitude = Math.sqrt(velocity_x * velocity_x + velocity_y * velocity_y)
      
      velocity_x /= magnitude
      velocity_y /= magnitude
    }
    
    velocity_x *= player.movement_speed
    velocity_y *= player.movement_speed

    player.position_x += velocity_x
    player.position_y += velocity_y
    player.velocity_x = velocity_x
    player.velocity_y = velocity_y
    
    game.set(entity, 'player', player)
  }
}

export default action

