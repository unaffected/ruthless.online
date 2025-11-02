import { create_soa_serializer, create_soa_deserializer } from '@/game/utility/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { health: number[] } 
}

export const packet: PacketDefinition<'health'> = {
  id: 'health',
  type: PACKET.HEALTH,
  serializer: (game) => create_soa_serializer([
    { name: 'current', type: 'f32', array: game.components.health.current },
    { name: 'maximum', type: 'f32', array: game.components.health.maximum },
  ]),
  deserializer: (game) => create_soa_deserializer([
    { name: 'current', type: 'f32', array: game.components.health.current },
    { name: 'maximum', type: 'f32', array: game.components.health.maximum },
  ]),
}

export default packet

