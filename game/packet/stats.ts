import { create_soa_serializer, create_soa_deserializer } from '@/game/utility/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' {
  interface Packets {
    stats: number[]
  }
}

export const packet: PacketDefinition<'stats'> = {
  id: 'stats',
  type: PACKET.STATS,
  serializer: (game) => create_soa_serializer([
    { name: 'health_current', type: 'f32', array: game.components.stats.health_current },
    { name: 'health_maximum', type: 'f32', array: game.components.stats.health_maximum },
    { name: 'health_regeneration', type: 'f32', array: game.components.stats.health_regeneration },
    { name: 'energy_current', type: 'f32', array: game.components.stats.energy_current },
    { name: 'energy_maximum', type: 'f32', array: game.components.stats.energy_maximum },
    { name: 'energy_regeneration', type: 'f32', array: game.components.stats.energy_regeneration },
    { name: 'speed', type: 'f32', array: game.components.stats.speed },
  ]),
  deserializer: (game) => create_soa_deserializer([
    { name: 'health_current', type: 'f32', array: game.components.stats.health_current },
    { name: 'health_maximum', type: 'f32', array: game.components.stats.health_maximum },
    { name: 'health_regeneration', type: 'f32', array: game.components.stats.health_regeneration },
    { name: 'energy_current', type: 'f32', array: game.components.stats.energy_current },
    { name: 'energy_maximum', type: 'f32', array: game.components.stats.energy_maximum },
    { name: 'energy_regeneration', type: 'f32', array: game.components.stats.energy_regeneration },
    { name: 'speed', type: 'f32', array: game.components.stats.speed },
  ]),
}

export default packet

