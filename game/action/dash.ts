import type { Action } from '@/game/config/action'
import { ACTION_TYPE, ACTION_CONDITION } from '@/game/config/action'
import type { State } from '@/game/utility/input'

declare module '@/game/config/action' {
  interface Actions {
    dash: DashAction
  }
}

export type DashAction = State

export const action: Action<'dash'> = {
  id: 'dash',
  type: ACTION_TYPE.ACTIVATED,
  conditions: ACTION_CONDITION.MOVING,
  startup_duration: 0,
  active_duration: 800,
  recovery_duration: 150,
  cooldown_duration: 1000,
  energy_cost: 15,
  
  on_activate: (ctx) => {
    ctx.game.add(ctx.entity, 'burst', { active: 1 })
    
    const velocity = ctx.game.get(ctx.entity, 'velocity')

    if (!velocity) return
    
    const mag = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)

    if (mag === 0) return
    
    const dir_x = velocity.x / mag
    const dir_y = velocity.y / mag
    
    const dash_speed = (110 / ctx.action.active_duration!) * 1000
    
    velocity.x = dir_x * dash_speed
    velocity.y = dir_y * dash_speed
    
    ctx.game.set(ctx.entity, 'velocity', velocity)
  },
  
  on_recovery: (ctx) => {
    ctx.game.remove(ctx.entity, 'burst')
    
    const velocity = ctx.game.get(ctx.entity, 'velocity')
    if (!velocity) return
    
    velocity.x = 0
    velocity.y = 0
    
    ctx.game.set(ctx.entity, 'velocity', velocity)
  },
}

export default action
