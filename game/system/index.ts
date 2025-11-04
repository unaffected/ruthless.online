import type { System, Systems } from '@/game'
import action from '@/game/system/action'
import collider from '@/game/system/collider'
import collision from '@/game/system/collision'
import combat from '@/game/system/combat'
import config from '@/game/system/config'
import despawn from '@/game/system/despawn'
import effect from '@/game/system/effect'
import event from '@/game/system/event'
import map from '@/game/system/map'
import packet from '@/game/system/packet'
import physics from '@/game/system/physics'
import stat from '@/game/system/stat'
import timer from '@/game/system/timer'

export type { System, Systems }

export const systems: Systems = [
  config,
  event,
  timer,
  stat,
  effect,
  packet,
  action,
  physics,
  collision,
  combat,
  map,
  collider,
  despawn,
]

export default systems