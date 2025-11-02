import { createSoASerializer, createSoADeserializer } from 'bitecs/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { rotation: number[] } 
}

export const packet: PacketDefinition<'rotation'> = {
  id: 'rotation',
  type: PACKET.ROTATION,
  serializer: (game) => createSoASerializer([game.components.rotation]),
  deserializer: (game) => createSoADeserializer([game.components.rotation]),
}

export default packet

