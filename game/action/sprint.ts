import type { Action } from '@/game/config/action'
import { ACTION_TYPE, ACTION_CONDITION } from '@/game/config/action'
import { STAT_OPERATION, STAT } from '@/game/system/stat'
import type { State } from '@/game/utility/input'

declare module '@/game/config/action' {
  interface Actions {
    sprint: SprintAction
  }
}

export type SprintAction = State

export const action: Action<'sprint'> = {
  id: 'sprint',
  type: ACTION_TYPE.CHANNELED,
  conditions: ACTION_CONDITION.MOVING,
  energy_cost: 5,
  energy_cost_per_second: 20,
  
  on_activate: (ctx) => {
    ctx.game.effect.apply('modifier', ctx.entity, {
      stat: STAT.SPEED,
      operation: STAT_OPERATION.MULTIPLY,
      value: 1.5,
      priority: 0
    }, ctx.action.id)
  },
  
  on_deactivate: (ctx) => {
    ctx.game.effect.remove_owned(ctx.entity, ctx.action.id)
  }
}

export default action
