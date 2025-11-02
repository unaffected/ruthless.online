import { createSoASerializer, createSoADeserializer } from 'bitecs/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { health: number[] } 
}

export const packet: PacketDefinition<'health'> = {
  id: 'health',
  type: PACKET.HEALTH,
  serializer: (game) => createSoASerializer([game.components.health]),
  deserializer: (game) => createSoADeserializer([game.components.health]),
}

export default packet

