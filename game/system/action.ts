import type { Game, System } from '@/game'
import actions from '@/game/action'
import event from '@/game/system/event'
import * as Action from '@/game/utility/action'

export { 
  ACTION_TYPE,
  ACTION_PHASE,
  ACTION_CONDITION,
  type ActionType,
  type ActionPhase,
  type ActionCondition,
  type ActionState,
  type ActionContext,
  type ACTION,
  type Action,
  type Actions
} from '@/game/config/action'

import type { ActionState, Action as ActionDef } from '@/game/config/action'

declare module '@/game' {
  interface Game {
    action: {
      definitions: Map<string, ActionDef>
      states: Map<number, Map<string, ActionState>>
      activate: (id: string, entity: number, params?: any) => boolean
      cancel: (id: string, entity: number) => boolean
      state: (id: string, entity: number) => ActionState | undefined
    }
  }
}

declare module '@/game/system/event' {
  interface Events {
    'game:action:activated': { entity: number, action_id: string }
    'game:action:cancelled': { entity: number, action_id: string }
    'game:action:phase_changed': { entity: number, action_id: string, phase: number }
  }
}

export const system: System = {
  id: 'game:action',
  dependencies: [event],

  install: async (game) => {
    game.action = {
      definitions: new Map(),
      states: new Map(),
      activate: (id, entity, params) => Action.activate(game, id, entity, params),
      cancel: (id, entity) => Action.cancel(game, id, entity),
      state: (id, entity) => game.action.states.get(entity)?.get(id),
    }

    actions.forEach((action) => game.action.definitions.set(String(action.id), action as ActionDef))
  },

  tick: async (game, delta) => {
    Action.tick(game, delta)
  }
}

export default system
