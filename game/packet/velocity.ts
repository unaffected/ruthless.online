import { create_soa_serializer, create_soa_deserializer } from '@/game/utility/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { velocity: number[] } 
}

export const packet: PacketDefinition<'velocity'> = {
  id: 'velocity',
  type: PACKET.VELOCITY,
  serializer: (game) => create_soa_serializer([
    { name: 'x', type: 'f32', array: game.components.velocity.x },
    { name: 'y', type: 'f32', array: game.components.velocity.y },
  ]),
  deserializer: (game) => create_soa_deserializer([
    { name: 'x', type: 'f32', array: game.components.velocity.x },
    { name: 'y', type: 'f32', array: game.components.velocity.y },
  ]),
}

export default packet

