import { create_soa_serializer, create_soa_deserializer } from '@/game/utility/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { position: number[] } 
}

export const packet: PacketDefinition<'position'> = {
  id: 'position',
  type: PACKET.POSITION,
  serializer: (game) => create_soa_serializer([
    { name: 'x', type: 'f32', array: game.components.position.x },
    { name: 'y', type: 'f32', array: game.components.position.y },
  ]),
  deserializer: (game) => create_soa_deserializer([
    { name: 'x', type: 'f32', array: game.components.position.x },
    { name: 'y', type: 'f32', array: game.components.position.y },
  ]),
}

export default packet

