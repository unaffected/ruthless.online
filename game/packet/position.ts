import { createSoASerializer, createSoADeserializer } from 'bitecs/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { position: number[] } 
}

export const packet: PacketDefinition<'position'> = {
  id: 'position',
  type: PACKET.POSITION,
  serializer: (game) => createSoASerializer([game.components.position]),
  deserializer: (game) => createSoADeserializer([game.components.position]),
}

export default packet

