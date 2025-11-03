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
    }

    game.on('server:player:disconnected', (connection) => { 
      game.controller.history.delete(connection)
    })

    game.on('server:player:input', (event) => {      
      const now = Date.now()
      const entity = game.connections.get(event.connection)

      if (entity === undefined) {
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
      
      const packed_buffer = input.pack(state)
      const packed_view = new DataView(packed_buffer)
      const packed_buttons = packed_view.getUint16(0, true)
      
      game.set(entity, 'input', { 
        packed: packed_buttons,
        sequence,
        mouse_x: state.MOUSE_X,
        mouse_y: state.MOUSE_Y
      })

      game.emit('server:controller:input', { connection: event.connection, entity, state, sequence })
    })
  },
  tick: async (game) => {
    if (game.connections.size === 0) return
    
    const entities = game.query([game.components.input])
    
    for (const entity of entities) {
      const component = game.get(entity, 'input')
      
      if (!component) continue
      
      const packed_buffer = new ArrayBuffer(6)
      const packed_view = new DataView(packed_buffer)
      packed_view.setUint16(0, component.packed, true)
      packed_view.setInt16(2, component.mouse_x, true)
      packed_view.setInt16(4, component.mouse_y, true)
      
      const state = input.unpack(packed_buffer)

      game.action('move', entity, state)
      
      if (state.ACTION_1) {
        game.action('shoot', entity, state)
      }
    }
  }
}

export default system

