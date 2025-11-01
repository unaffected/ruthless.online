import type { Systems } from '@/game'
import controller from '@/server/system/controller'
import network from '@/server/system/network'
import player from '@/server/system/player'

export const systems: Systems = [
  controller,
  network,
  player,
]

export default systems