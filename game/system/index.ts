import type { Game } from '@/game'
import action from '@/game/system/action'
import despawn from '@/game/system/despawn'
import event from '@/game/system/event'
import timer from '@/game/system/timer'

export type System<O extends Record<string, unknown> = {}> = {
  id: string
  install?: (this: Game, game: Game, options?: O) => Promise<void>
  tick?: (this: Game, game: Game, delta: number) => Promise<void>
  dependencies?: Array<System>
  options?: O
}

export type Systems = Array<Systems | System>

export const systems: Systems = [
  action,
  despawn,
  event,
  timer,
]

export default systems