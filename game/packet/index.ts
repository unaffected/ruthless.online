import type { PacketDefinition } from '@/game/system/packet'
import connected from './connected'
import entities from './entities'
import position from './position'
import velocity from './velocity'
import rotation from './rotation'
import projectile from './projectile'
import stats from './stats'

export const packets: PacketDefinition[] = [
  connected,
  entities,
  position,
  velocity,
  rotation,
  projectile,
  stats,
]

export default packets

