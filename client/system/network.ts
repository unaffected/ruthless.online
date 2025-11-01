import { createSnapshotDeserializer, createObserverDeserializer, createSoADeserializer } from 'bitecs/serialization'
import { type System } from '@/game'
import * as packet from '@/game/utility/packet'

declare module '@/game/system/event' {
  interface Events {
    'client:player:connected': WebSocket
  }
}

declare module '@/game' { 
  interface Game {
    entity: number
    socket: WebSocket
  }
}

export const system: System = {
  id: 'client:network' as const,
  install: async (game) => {
    const entities = new Map<number, number>()
    const components = [game.components.player]

    const observerDeserializer = createObserverDeserializer(game.world, game.components.sync, components)
    const snapshotDeserializer = createSnapshotDeserializer(game.world, components)
    const updateDeserializer = createSoADeserializer(components)

    game.socket = new WebSocket('/socket')
    game.socket.binaryType = 'arraybuffer'

    game.socket.addEventListener('open', () => {
      game.emit('client:player:connected', game.socket)

      console.debug('[client:network] connected to server')
    })

    game.socket.addEventListener('close', () => {
      console.debug('[client:network] disconnected from server')
    })

    game.socket.addEventListener('message', (event) => {
      const message = packet.parse(event.data)
    
      switch (message.type) {
        case packet.PACKET.SNAPSHOT:
          snapshotDeserializer(message.data, entities)
          break
        case packet.PACKET.SYNC:
          observerDeserializer(message.data, entities)
          break
        case packet.PACKET.UPDATE:
          updateDeserializer(message.data, entities)
          break
        case packet.PACKET.CONNECTED:
          game.entity = new DataView(message.data).getUint32(0, true)
          console.debug(`[client:network] connection accepted: #${game.entity}`)
          break
      }
    })

    console.debug('[client:network] initialized')
  }
}

export default system