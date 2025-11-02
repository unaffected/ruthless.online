import { type System } from '@/game'
import packet_system from '@/game/system/packet'

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
  dependencies: [packet_system],
  install: async (game) => {
    const entities = new Map<number, number>()

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
      const buffer = new Uint8Array(event.data)
      const packet_type = buffer[0]!
      const data = buffer.slice(1).buffer
      
      const packet = game.packet.types.get(packet_type)
      if (packet) {
        packet.decode(game, data, entities)
      } else {
        console.warn(`[client:network] unknown packet type: ${packet_type}`)
      }
    })
  }
}

export default system