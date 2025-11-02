import { type System } from '@/game'
import { default as packet_system, type PACKET as TYPE } from '@/game/system/packet'
import { PACKET } from '@/game/utility/packet'
import grid from '@/server/system/grid'
import event from '@/game/system/event'
import index from "@/client/canvas/index.html"

declare module '@/game/system/event' {
  interface Events {
    'server:player:connected': Connection
    'server:player:disconnected': Connection
    'server:player:input': { 
      connection: Connection, 
      input: string | Buffer<ArrayBuffer>,
    }
    'server:network:sync': {
      connection: Connection
      entity: number
      relevant_entities: number[]
    }
  }
}

declare module '@/game' { 
  interface Game {
    connections: Map<Connection, number>
    observers: Map<Connection, () => ArrayBuffer>
    server: Bun.Server<Socket>
    send: <P extends TYPE>(connection: Connection, type: P, entities: number[]) => void
  }
}

export type Connection = Bun.ServerWebSocket<Socket>

export interface Connections { [key: number]: Connection }

export type Socket = {}

export const system: System = {
  id: 'server:network' as const,
  dependencies: [packet_system, grid, event],
  install: async (game) => {
    game.connections = new Map<Connection, number>()
    game.observers = new Map<Connection, () => ArrayBuffer>()

    game.send = <P extends TYPE>(connection: Connection, type: P, entities: number[]) => {
      const packet = game.packet.registry.get(type)

      if (!packet) {
        console.warn(`[server:network] unknown packet: ${type}`)
        return
      }

      const data = packet.encode(game, entities)
      const buffer = new Uint8Array(data.byteLength + 1)
      
      buffer[0] = packet.type
      buffer.set(new Uint8Array(data), 1)

      connection.send(buffer.buffer)
    }

    game.server = Bun.serve<Socket>({
      development: process.env.NODE_ENV !== "production" && {
        hmr: true,
        console: true,
      },

      routes: {
        "/*": index,
    
        "/socket": async (request, server) => {
          const upgrade = request.headers.get('upgrade') ?? ''
    
          if (upgrade.toLowerCase() !== 'websocket') {
            return new Response('Not found', { status: 404 })
          }
    
          server.upgrade(request, { data: {} as Socket })
          
          return new Response('Upgrading to WebSocket', { status: 101 })
        },
      },

      port: import.meta.env.PORT ?? 8080,

      websocket: {
        close: (connection: Connection) => {
          const player = game.connections.get(connection)!
          
          game.despawn(player)

          game.connections.delete(connection)
          game.observers.delete(connection)

          game.emit('server:player:disconnected', connection)

          console.debug(`[server:network] player disconnected: #${player}`)
        },

        message: async (connection: Connection, input: Buffer<ArrayBuffer> ) => {
          game.emit('server:player:input', { connection, input })
        },
        
        open: (connection: Connection) => {
          const entity = game.spawn()

          game.connections.set(connection, entity)
          
          const entities = game.packet.registry.get('entities')!

          game.observers.set(connection, entities.serializer(game) as () => ArrayBuffer)

          game.send(connection, 'connected', [entity])

          game.emit('server:player:connected', connection)

          console.debug(`[server:network] player connected: #${entity}`)
        },
      },
    })

  },
  tick: async (game) => {
    if (game.frame % 2 !== 0) return

    for (const [connection, entity] of game.connections) {
      const entities_data = game.observers.get(connection)!()

      if (entities_data && entities_data.byteLength > 0) {
        const buffer = new Uint8Array(entities_data.byteLength + 1)
        buffer[0] = PACKET.ENTITIES
        buffer.set(new Uint8Array(entities_data), 1)
        connection.send(buffer.buffer)
      }

      const position = game.get(entity, 'position')

      const relevant_entities = position 
        ? game.grid.load(position.x, position.y)
        : [entity]

      game.emit('server:network:sync', { 
        connection, 
        entity,
        relevant_entities,
      })
    }
  }
}

export default system