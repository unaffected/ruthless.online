import type { Systems } from '@/game'
import controller from '@/server/system/controller'
import delta from '@/server/system/delta'
import network from '@/server/system/network'
import player from '@/server/system/player'
import spatial from '@/server/system/grid'
import sync from '@/server/system/sync'

export const systems: Systems = [
  network,
  spatial,
  delta,
  sync,
  controller,
  player,
]

export default systems