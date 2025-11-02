import { createObserverSerializer, createObserverDeserializer } from 'bitecs/serialization'
import { PACKET } from '@/game/utility/packet'
import type { PacketDefinition } from '@/game/system/packet'

declare module '@/game/system/packet' { 
  interface Packets { entities: void } 
}

export const packet: PacketDefinition<'entities'> = {
  id: 'entities',
  type: PACKET.ENTITIES,
  serializer: (game) => {
    const components = [
      game.components.position,
      game.components.velocity,
      game.components.rotation,
      game.components.health,
      game.components.movement,
    ]

    return createObserverSerializer(game.world, game.components.sync, components)
  },
  deserializer: (game) => {
    const components = [
      game.components.position,
      game.components.velocity,
      game.components.rotation,
      game.components.health,
      game.components.movement,
    ]
    
    return createObserverDeserializer(game.world, game.components.sync, components)
  },
}

export default packet

