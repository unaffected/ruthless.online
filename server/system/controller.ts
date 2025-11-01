import { type System } from '@/game'
import * as input from '@/game/utility/input'
import * as packet from '@/game/utility/packet'
import network, { type Connection } from '@/server/system/network'

declare module '@/game/system/event' {
  interface Events {
    'server:controller:input': { 
      connection: Connection
      entity: number
      state: input.State
      sequence: number
    }
    'server:controller:throttled': {
      connection: Connection
      entity: number
    }
  }
}

declare module '@/game' { 
  interface Game {
    controller: {
      throttle_ms: number
      history: Map<Connection, number>
      sequences: Map<number, number>
    }
  }
}

export const system: System = {
  id: 'server:controller' as const,
  dependencies: [network],
  install: async (game) => {
    game.controller = {
      throttle_ms: game.option('input_rate_limit', 100 / game.option('framerate', 60)),
      history: new Map<Connection, number>(),
      sequences: new Map<number, number>(),
    }

    game.on('server:player:input', (event) => {
      const now = Date.now()
      const entity = game.connections.get(event.connection)

      if (!entity) {
        console.warn('[server:controller] received input from unknown connection')
        return
      }

      const last = game.controller.history.get(event.connection) ?? 0
      const elapsed = now - last

      if (elapsed < game.controller.throttle_ms) {
        game.emit('server:controller:throttled', { connection: event.connection, entity })
        console.warn(`[server:controller] rate limited: #${entity}`)
        return
      }

      game.controller.history.set(event.connection, now)

      const view = new DataView((event.input as Buffer<ArrayBuffer>).buffer)
      const { state, sequence } = packet.input.decode(view)

      game.controller.sequences.set(entity, sequence)

      game.emit('server:controller:input', { connection: event.connection, entity, state, sequence })

      game.action('move', entity, { input: state })
    })

    game.on('server:player:disconnected', (connection) => {
      const entity = game.connections.get(connection)
      
      if (entity) {
        game.controller.sequences.delete(entity)
      }
      
      game.controller.history.delete(connection)
    })
  },
}

export default system

