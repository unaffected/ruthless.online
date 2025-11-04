import type { Game, COMPONENT } from '@/game'
import { create_observer } from '@/game/utility/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { entities: void } 
}

const COMPONENT_IDS: Record<string, number> = {
  sync: 0,
  position: 1,
  velocity: 2,
  rotation: 3,
  stats: 4,
  projectile: 5,
  input: 6,
  collider: 7,
  action: 8,
  effect: 9,
  despawned: 10
}

const ID_TO_COMPONENT = Object.fromEntries(
  Object.entries(COMPONENT_IDS).map(([k, v]) => [v, k])
) as Record<number, COMPONENT>

const get_entity_components = (game: Game, entity: number): number[] => {
  const components: number[] = []
  
  for (const [name, id] of Object.entries(COMPONENT_IDS)) {
    if (game.has(entity, name as COMPONENT)) {
      components.push(id)
    }
  }
  
  return components
}

export const packet: PacketDefinition<'entities'> = {
  id: 'entities',
  type: PACKET.ENTITIES,
  serializer: (game) => {
    const observer = create_observer((entity) => get_entity_components(game, entity))

    return (entities?: number[]) => observer.serialize(entities ?? game.query([game.components.sync]))
  },
  deserializer: (game) => {
    const observer = create_observer(() => [])

    return (data: ArrayBuffer, entity_map: Map<number, number>) => {
      observer.deserialize(
        data,
        entity_map,
        (server_entity, component_ids) => {
          let client_entity = entity_map.get(server_entity)
          
          if (client_entity === undefined) {
            client_entity = game.spawn()
            entity_map.set(server_entity, client_entity)
          }
          
          if (component_ids) {
            for (const id of component_ids) {
              const component_name = ID_TO_COMPONENT[id]
              if (component_name && !game.has(client_entity, component_name)) {
                game.add(client_entity, component_name)
              }
            }
          }
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

