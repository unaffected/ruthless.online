import { createSoASerializer, createSoADeserializer } from 'bitecs/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { movement: number[] } 
}

export const packet: PacketDefinition<'movement'> = {
  id: 'movement',
  type: PACKET.MOVEMENT,
  serializer: (game) => createSoASerializer([game.components.movement]),
  deserializer: (game) => createSoADeserializer([game.components.movement]),
}

export default packet

