import type { Action } from '@/game/config/action'
import { ACTION_TYPE } from '@/game/config/action'
import type { State } from '@/game/utility/input'

declare module '@/game/config/action' {
  interface Actions {
    move: MoveAction
  }
}

export type MoveAction = State

export const action: Action<'move'> = {
  id: 'move',
  type: ACTION_TYPE.CHANNELED,
  
  on_channel_tick: (ctx) => {
    const velocity = ctx.game.get(ctx.entity, 'velocity')

    if (!velocity) return

    const params = ctx.params as State

    if (!params) {
      ctx.game.set(ctx.entity, 'velocity', { x: 0, y: 0 })

      return
    }
    
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
    
    const speed = ctx.game.stats.get(ctx.entity, 'speed')

    vx *= speed
    vy *= speed

    ctx.game.set(ctx.entity, 'velocity', { x: vx, y: vy })
  },
  
  on_deactivate: (ctx) => {
    ctx.game.set(ctx.entity, 'velocity', { x: 0, y: 0 })
  }
}

export default action

