import { createSnapshotSerializer, createObserverSerializer, createSoASerializer } from 'bitecs/serialization'
import { type System } from '@/game'
import * as packet from '@/game/utility/packet'
import index from "@/client/canvas/index.html"

declare module '@/game/system/event' {
  interface Events {
    'server:player:connected': Connection
    'server:player:disconnected': Connection
    'server:player:input': { 
      connection: Connection, 
      input: string | Buffer<ArrayBuffer>,
    }
  }
}

declare module '@/game' { 
  interface Game {
    connections: Map<Connection, number>
    observers: Map<Connection, ReturnType<typeof createObserverSerializer>>
    server: Bun.Server<Socket>
    send: (connection: Connection, type: packet.Packet, data: ArrayBuffer) => void
    sync: (connection: Connection) => void
  }
}

export type Connection = Bun.ServerWebSocket<Socket>

export interface Connections { [key: number]: Connection }

export type Socket = {}

export const system: System = {
  id: 'server:network' as const,
  install: async (game) => {
    const components = [game.components.player]

    const snapshotSerializer = createSnapshotSerializer(game.world, components)
    const updateSerializer = createSoASerializer(components)

    game.connections = new Map<Connection, number>()

    game.observers = new Map<Connection, ReturnType<typeof createObserverSerializer>>()

    game.send = (connection: Connection, type: packet.Packet, data: ArrayBuffer) => {
      connection.send(packet.make(type, data))
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
          game.observers.set(connection, createObserverSerializer(game.world, game.components.sync, components))

          game.send(connection, packet.PACKET.SNAPSHOT, snapshotSerializer())

          game.emit('server:player:connected', connection)

          console.debug(`[server:network] player connected: #${entity}`)
        },
      },
    })

    game.sync = (connection: Connection) => {
      const entities = game.observers.get(connection)!()

      if (entities && entities.byteLength > 0) {
        game.send(connection, packet.PACKET.ENTITIES, entities)
      }

      game.send(connection, packet.PACKET.UPDATE, updateSerializer(game.query([
        game.components.sync,
        game.components.player,
      ])))
    }
  },
  tick: async (game) => {
    if (game.frame % 2 !== 0) return

    for (const connection of game.connections.keys()) {
      game.sync(connection)
    }
  }
}

export default system