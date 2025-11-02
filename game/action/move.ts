import type { Action } from '@/game/system/action'
import type { State } from '@/game/utility/input'

declare module '@/game/system/action' { interface Actions { move: MoveAction } }

export type MoveAction = State

export const action: Action<'move'> = {
  id: 'move',
  execute: (game, entity, params) => {
    const position = game.get(entity, 'position')!
    const velocity = game.get(entity, 'velocity')!
    const movement = game.get(entity, 'movement')!

    if (!position || !velocity || !movement) return
    
    let vx = 0
    let vy = 0
    
    if (params.LEFT) vx -= 1
    if (params.RIGHT) vx += 1
    if (params.UP) vy -= 1
    if (params.DOWN) vy += 1
    
    if (vx !== 0 && vy !== 0) {
      const magnitude = Math.sqrt(vx * vx + vy * vy)
      
      vx /= magnitude
      vy /= magnitude
    }
    
    vx *= movement.speed
    vy *= movement.speed

    game.set(entity, 'velocity', { x: vx, y: vy })

    game.set(entity, 'position', { 
      x: position.x + vx, 
      y: position.y + vy 
    })
  }
}

export default action

