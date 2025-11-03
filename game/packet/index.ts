import type { PacketDefinition } from '@/game/system/packet'
import connected from './connected'
import entities from './entities'
import position from './position'
import velocity from './velocity'
import rotation from './rotation'
import health from './health'
import energy from './energy'
import movement from './movement'

export const packets: PacketDefinition[] = [
  connected,
  entities,
  position,
  velocity,
  rotation,
  health,
  energy,
  movement,
]

export default packets

