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
  deserializer: (game) => (data, entity_map) => {
    const server_entity = new DataView(data).getUint32(0, true)
    const client_entity = game.spawn()
    
    entity_map.set(server_entity, client_entity)
    game.entity = client_entity
  },
}

export default packet

