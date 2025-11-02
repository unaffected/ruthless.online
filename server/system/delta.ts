import { type Game, type System, type COMPONENT } from '@/game'
import type { Connection } from '@/server/system/network'
import event from '@/game/system/event'

declare module '@/game' {
  interface Game {
    delta: {
      states: Map<Connection, Map<number, Map<COMPONENT, any>>>
      is_dirty: (connection: Connection, entity: number, component: COMPONENT, threshold: number) => boolean
    }
  }
}

export const system: System = {
  id: 'server:delta',
  dependencies: [event],
  install: async (game) => {
    game.delta = {
      states: new Map(),
      
      is_dirty: (connection, entity, component, threshold) => {
        const connection_state = game.delta.states.get(connection)
        if (!connection_state) return true
        
        const entity_state = connection_state.get(entity)
        if (!entity_state) return true
        
        const component_state = entity_state.get(component)
        if (!component_state) return true
        
        const current = game.get(entity, component)
        if (!current) return false
        
        for (const [key, value] of Object.entries(current)) {
          if (Math.abs((value as number) - (component_state[key] as number)) >= threshold) {
            return true
          }
        }
        
        return false
      }
    }
    
    game.on('server:player:disconnected', (connection) => {
      game.delta.states.delete(connection)
    })
  }
}

export default system

