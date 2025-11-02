import { create_soa_serializer, create_soa_deserializer } from '@/game/utility/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { movement: number[] } 
}

export const packet: PacketDefinition<'movement'> = {
  id: 'movement',
  type: PACKET.MOVEMENT,
  serializer: (game) => create_soa_serializer([
    { name: 'speed', type: 'f32', array: game.components.movement.speed },
  ]),
  deserializer: (game) => create_soa_deserializer([
    { name: 'speed', type: 'f32', array: game.components.movement.speed },
  ]),
}

export default packet

