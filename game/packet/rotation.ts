import { create_soa_serializer, create_soa_deserializer } from '@/game/utility/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { rotation: number[] } 
}

export const packet: PacketDefinition<'rotation'> = {
  id: 'rotation',
  type: PACKET.ROTATION,
  serializer: (game) => create_soa_serializer([
    { name: 'value', type: 'f32', array: game.components.rotation.value },
  ]),
  deserializer: (game) => create_soa_deserializer([
    { name: 'value', type: 'f32', array: game.components.rotation.value },
  ]),
}

export default packet

