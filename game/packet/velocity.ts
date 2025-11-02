import { createSoASerializer, createSoADeserializer } from 'bitecs/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { velocity: number[] } 
}

export const packet: PacketDefinition<'velocity'> = {
  id: 'velocity',
  type: PACKET.VELOCITY,
  serializer: (game) => createSoASerializer([game.components.velocity]),
  deserializer: (game) => createSoADeserializer([game.components.velocity]),
}

export default packet

