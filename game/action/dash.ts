import type { Action } from '@/game/config/action'
import { ACTION_TYPE, ACTION_CONDITION } from '@/game/config/action'
import { STAT_OPERATION, STAT } from '@/game/system/stat'
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
  active_duration: 200,
  recovery_duration: 150,
  cooldown_duration: 1000,
  energy_cost: 15,
  
  on_activate: (ctx) => {
    ctx.game.effect.apply('modifier', ctx.entity, {
      stat: STAT.SPEED,
      operation: STAT_OPERATION.MULTIPLY,
      value: 4,
      priority: 0
    }, ctx.action.id)
  },
  
  on_recovery: (ctx) => {
    ctx.game.effect.remove_owned(ctx.entity, ctx.action.id)
  }
}

export default action
