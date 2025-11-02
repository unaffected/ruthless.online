import type { Systems } from '@/game'
import collision from '@/server/system/collision'
import controller from '@/server/system/controller'
import network from '@/server/system/network'
import physics from '@/server/system/physics'
import player from '@/server/system/player'

export const systems: Systems = [
  collision,
  controller,
  network,
  physics,
  player,
]

export default systems