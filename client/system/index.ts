import type { Systems } from '@/game'
import camera from '@/client/system/camera'
import controller from '@/client/system/controller'
import graphic from '@/client/system/graphic'
import interpolation from '@/client/system/interpolation'
import scene from '@/client/system/scene'
import map from '@/client/system/map'
import network from '@/client/system/network'
import player from '@/client/system/player'
import prediction from '@/client/system/prediction'
import hud from '@/client/system/hud'

export const systems: Systems = [
  hud,
  camera,
  controller,
  graphic,
  interpolation,
  scene,
  map,
  network,
  player,
  prediction,
]

export default systems