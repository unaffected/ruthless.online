import { create_observer } from '@/game/utility/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { entities: void } 
}

export const packet: PacketDefinition<'entities'> = {
  id: 'entities',
  type: PACKET.ENTITIES,
  serializer: (game) => {
    const observer = create_observer()

    return (entities?: number[]) => observer.serialize(entities ?? game.query([game.components.sync]))
  },
  deserializer: (game) => {
    const observer = create_observer()

    return (data: ArrayBuffer, entity_map: Map<number, number>) => {
      observer.deserialize(
        data,
        entity_map,
        (server_entity) => {
          let client_entity = entity_map.get(server_entity)
          
          if (client_entity === undefined) {
            client_entity = game.spawn()
            entity_map.set(server_entity, client_entity)
          }
          
          game.add(client_entity, 'sync')
          game.add(client_entity, 'position')
          game.add(client_entity, 'velocity')
          game.add(client_entity, 'rotation')
          game.add(client_entity, 'health')
          game.add(client_entity, 'energy')
          game.add(client_entity, 'movement')
        },
        (server_entity) => {
          const client_entity = entity_map.get(server_entity)

          if (client_entity === undefined) return

          game.despawn(client_entity)
          entity_map.delete(server_entity)
        }
      )
    }
  },
}

export default packet

