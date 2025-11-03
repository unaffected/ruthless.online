import type { System, Systems } from '@/game'
import action from '@/game/system/action'
import collider from '@/game/system/collider'
import collision from '@/game/system/collision'
import combat from '@/game/system/combat'
import config from '@/game/system/config'
import despawn from '@/game/system/despawn'
import event from '@/game/system/event'
import map from '@/game/system/map'
import packet from '@/game/system/packet'
import physics from '@/game/system/physics'
import projectile from '@/game/system/projectile'
import regeneration from '@/game/system/regeneration'
import timer from '@/game/system/timer'

export type { System, Systems }

export const systems: Systems = [
  config,
  event,
  timer,
  packet,
  action,
  physics,
  collision,
  combat,
  map,
  collider,
  projectile,
  regeneration,
  despawn,
]

export default systems