import { type System, type COMPONENT } from '@/game'
import network from '@/server/system/network'
import delta from '@/server/system/delta'
import event from '@/game/system/event'

type SyncConfig = {
  component: COMPONENT
  packet: string
  threshold_option: string
  threshold_default: number
}

const SYNC_COMPONENTS: SyncConfig[] = [
  {
    component: 'position',
    packet: 'position',
    threshold_option: 'network_position_sync_threshold',
    threshold_default: 1.0,
  },
  {
    component: 'velocity',
    packet: 'velocity',
    threshold_option: 'network_velocity_sync_threshold',
    threshold_default: 0.1,
  },
  {
    component: 'rotation',
    packet: 'rotation',
    threshold_option: 'network_rotation_sync_threshold',
    threshold_default: 0.01,
  },
  {
    component: 'health',
    packet: 'health',
    threshold_option: 'network_health_sync_threshold',
    threshold_default: 1.0,
  },
  {
    component: 'movement',
    packet: 'movement',
    threshold_option: 'network_movement_sync_threshold',
    threshold_default: 0.1,
  },
]

export const system: System = {
  id: 'server:sync',
  dependencies: [event, network, delta],
  install: async (game) => {
    game.on('server:network:sync', ({ connection, relevant_entities }) => {
      for (const config of SYNC_COMPONENTS) {
        const threshold = game.option(config.threshold_option as any, config.threshold_default)
        
        const dirty_entities = relevant_entities.filter(entity =>
          game.has(entity, config.component) &&
          game.delta.is_dirty(connection, entity, config.component, threshold)
        )
        
      if (dirty_entities.length === 0) continue
      
      game.send(connection, config.packet, dirty_entities)
        
        let connection_state = game.delta.states.get(connection)
        if (!connection_state) {
          connection_state = new Map()
          game.delta.states.set(connection, connection_state)
        }
        
        for (const entity of dirty_entities) {
          let entity_state = connection_state.get(entity)
          if (!entity_state) {
            entity_state = new Map()
            connection_state.set(entity, entity_state)
          }
          
          const current = game.get(entity, config.component)
          if (current) {
            entity_state.set(config.component, { ...current })
          }
        }
      }
    })
  }
}

export default system

