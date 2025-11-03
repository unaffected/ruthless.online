import { create_soa_serializer, create_soa_deserializer } from '@/game/utility/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { projectile: number[] } 
}

export const packet: PacketDefinition<'projectile'> = {
  id: 'projectile',
  type: PACKET.PROJECTILE,
  serializer: (game) => create_soa_serializer([
    { name: 'owner', type: 'u32', array: game.components.projectile.owner },
    { name: 'damage', type: 'f32', array: game.components.projectile.damage },
    { name: 'lifetime', type: 'f32', array: game.components.projectile.lifetime },
    { name: 'spawned_at', type: 'f32', array: game.components.projectile.spawned_at },
  ]),
  deserializer: (game) => {
    const base_deserializer = create_soa_deserializer([
      { name: 'owner', type: 'u32', array: game.components.projectile.owner },
      { name: 'damage', type: 'f32', array: game.components.projectile.damage },
      { name: 'lifetime', type: 'f32', array: game.components.projectile.lifetime },
      { name: 'spawned_at', type: 'f32', array: game.components.projectile.spawned_at },
    ])
    
    return (data: ArrayBuffer, entity_map: Map<number, number>) => {
      const view = new DataView(data)
      const count = view.getUint32(0, true)
      let offset = 4
      
      for (let i = 0; i < count; i++) {
        const server_entity = view.getUint32(offset, true)
        const client_entity = entity_map.get(server_entity)
        
        if (client_entity !== undefined && !game.has(client_entity, 'projectile')) {
          game.add(client_entity, 'projectile')
        }
        
        offset += 4 + 16
      }
      
      base_deserializer(data, entity_map)
    }
  },
}

export default packet

