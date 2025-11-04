import type { Game } from '@/game'

export type HIT_HANDLER = keyof HitHandlers

export interface HitHandlers {}

export type HitHandler<K extends HIT_HANDLER = HIT_HANDLER> = {
  id: K
  check: (game: Game, entityA: number, entityB: number) => boolean
  execute: (game: Game, entityA: number, entityB: number) => void
}

