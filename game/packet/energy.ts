import { create_soa_serializer, create_soa_deserializer } from '@/game/utility/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { energy: number[] } 
}

export const packet: PacketDefinition<'energy'> = {
  id: 'energy',
  type: PACKET.ENERGY,
  serializer: (game) => create_soa_serializer([
    { name: 'current', type: 'f32', array: game.components.energy.current },
    { name: 'maximum', type: 'f32', array: game.components.energy.maximum },
    { name: 'regeneration', type: 'f32', array: game.components.energy.regeneration },
  ]),
  deserializer: (game) => create_soa_deserializer([
    { name: 'current', type: 'f32', array: game.components.energy.current },
    { name: 'maximum', type: 'f32', array: game.components.energy.maximum },
    { name: 'regeneration', type: 'f32', array: game.components.energy.regeneration },
  ]),
}

export default packet

