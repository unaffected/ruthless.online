import { type Game, type System } from '@/game'
import packets from '@/game/packet'

export type PACKET = keyof Packets

export interface Packets {}

export type PacketDefinition<K extends PACKET = PACKET> = {
  id: K
  type: number
  serializer: (game: Game) => (entities: number[]) => ArrayBuffer
  deserializer: (game: Game) => (data: ArrayBuffer, entities: Map<number, number>) => void
}

export type Packet<K extends PACKET = PACKET> = PacketDefinition<K> & {
  encode: (game: Game, entities: number[]) => ArrayBuffer
  decode: (game: Game, data: ArrayBuffer, entities: Map<number, number>) => void
}

declare module '@/game' {
  interface Game {
    packet: {
      registry: Map<string, Packet>
      types: Map<number, Packet>
    }
  }
}

export const system: System = {
  id: 'game:packet',
  install: async (game) => {
    game.packet = {
      registry: new Map(),
      types: new Map(),
    }
    
    packets.forEach(definition => {
      const serializer = definition.serializer(game)
      const deserializer = definition.deserializer(game)
      
      const packet: Packet = {
        ...definition,
        encode: (game, entities) => serializer(entities),
        decode: (game, data, entities) => deserializer(data, entities),
      }
      
      game.packet.registry.set(packet.id, packet)
      game.packet.types.set(packet.type, packet)
    })
  }
}

export default system

