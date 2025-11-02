import type { System, Systems } from '@/game'
import action from '@/game/system/action'
import collider from '@/game/system/collider'
import despawn from '@/game/system/despawn'
import event from '@/game/system/event'
import packet from '@/game/system/packet'
import timer from '@/game/system/timer'

export type { System, Systems }

export const systems: Systems = [
  event,
  timer,
  packet,
  action,
  collider,
  despawn,
]

export default systems