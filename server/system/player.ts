import { type System } from '@/game'
import { PACKET } from '@/game/utility/packet'
import network from '@/server/system/network'

declare module '@/game/system/event' {
  interface Events {}
}

declare module '@/game' { 
  interface Game {}
}

export const system: System = {
  id: 'server:player' as const,
  dependencies: [network],
  install: async (game) => {
    game.on('server:player:connected', (connection) => {
      const entity = game.connections.get(connection)!

      game.add(entity, 'sync')
      game.add(entity, 'player', { 
        health_current: 100.00, 
        health_max: 100.0, 
        movement_speed: 12.0,
        position_x: 50.0,
        position_y: 25.0,
        velocity_x: 0.0,
        velocity_y: 0.0,
        rotation: 0.0,
      })

      game.send(connection, PACKET.CONNECTED, new Uint32Array([entity]).buffer)

      console.debug(`[server:player] player spawned: #${entity}`)
    })
  },
}

export default system