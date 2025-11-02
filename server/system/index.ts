import type { Systems } from '@/game'
import collision from '@/server/system/collision'
import controller from '@/server/system/controller'
import delta from '@/server/system/delta'
import network from '@/server/system/network'
import physics from '@/server/system/physics'
import player from '@/server/system/player'
import spatial from '@/server/system/grid'
import sync from '@/server/system/sync'

export const systems: Systems = [
  network,
  spatial,
  delta,
  sync,
  collision,
  controller,
  physics,
  player,
]

export default systems