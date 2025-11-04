import { type System, type COMPONENT } from '@/game'
import type { PACKET } from '@/game/system/packet'
import network from '@/server/system/network'
import delta from '@/server/system/delta'
import event from '@/game/system/event'

const CONFIG: Array<{
  packet: COMPONENT & PACKET
  threshold: number
}> = [{
  packet: 'position',
  threshold: 1.0,
}, {
  packet: 'velocity',
  threshold: 0.1,
}, {
  packet: 'rotation',
  threshold: 0.01,
}, {
  packet: 'stats',
  threshold: 1.0,
}, {
  packet: 'projectile',
  threshold: 1.0,
}] as const

export const system: System = {
  id: 'server:sync',
  dependencies: [event, network, delta],
  install: async (game) => {
    game.on('server:network:sync', ({ connection, entity, nearby }) => {
      for (const config of CONFIG) {        
        let dirty = nearby.filter(entity =>
          game.has(entity, config.packet) &&
          game.delta.is_dirty(connection, entity, config.packet, config.threshold)
        )
        
        if (config.packet === 'projectile') {
          dirty = dirty.filter(projectile_entity => {
            const projectile = game.get(projectile_entity, 'projectile')
            return projectile ? projectile.owner !== entity : true
          })
        }
        
        if (dirty.length === 0) continue
      
        game.send(connection, config.packet, dirty)
        
        let deltas = game.delta.states.get(connection)

        if (!deltas) {
          deltas = new Map()

          game.delta.states.set(connection, deltas)
        }
        
        for (const entity of dirty) {
          let memory = deltas.get(entity)

          if (!memory) {
            memory = new Map()

            deltas.set(entity, memory)
          }
          
          const current = game.get(entity, config.packet)

          if (!current) continue
            
          memory.set(config.packet, current)
        }
      }
    })
  }
}

export default system

