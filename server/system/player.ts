import { type System } from '@/game'
import network from '@/server/system/network'

export const system: System = {
  id: 'server:player' as const,
  dependencies: [network],
  install: async (game) => {
    game.on('server:player:connected', (connection) => {
      const entity = game.connections.get(connection)!

      game.add(entity, 'sync')
      game.add(entity, 'input', { packed: 0, sequence: 0 })
      game.add(entity, 'position', { x: 50.0, y: 25.0 })
      game.add(entity, 'velocity', { x: 0.0, y: 0.0 })
      game.add(entity, 'rotation', { value: 0.0 })
      game.add(entity, 'health', { current: 100.0, maximum: 100.0 })
      game.add(entity, 'movement', { speed: 6.0 })

      console.debug(`[server:player] player spawned: #${entity}`)
    })
  },
}

export default system