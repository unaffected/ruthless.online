import { type Game, type System } from '@/game'
import actions from '@/game/action'
import event from '@/game/system/event'

export type ACTION = keyof Actions

export type Action<K extends ACTION = ACTION> = {
  id: K
  execute: (game: Game, entity: number, params: Actions[K]) => void
}

export interface Actions {}

declare module '@/game' { 
  interface Game {
    actions: Map<string, Action>
    action: <K extends keyof Actions>(id: K, entity: number, params: Actions[K]) => boolean
  }
}

export const system: System = {
  id: 'game:action' as const,
  dependencies: [event],
  install: async (game) => {
    game.actions = new Map()

    game.action = (id, entity, params) => {
      const action = game.actions.get(id)
      
      if (!action) {
        console.warn(`[action] Action '${id}' not found`)
        return false
      }
      
      action.execute(game, entity, params)
      
      return true
    }

    actions.forEach((action) => { game.actions.set(action.id, action) })

    console.debug('[game:action] system initialized')
  }
}

export default system
