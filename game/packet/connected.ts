import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { connected: number } 
}

export const packet: PacketDefinition<'connected'> = {
  id: 'connected',
  type: PACKET.CONNECTED,
  serializer: () => (entities) => {
    const buffer = new ArrayBuffer(4)

    new DataView(buffer).setUint32(0, entities[0]!, true)

    return buffer
  },
  deserializer: (game) => (data) => {
    game.entity = new DataView(data).getUint32(0, true)
    
    console.debug(`[client:network] connection accepted: #${game.entity}`)
  },
}

export default packet

