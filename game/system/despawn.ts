import { type System } from '@/game'

declare module '@/game/system/event' { interface Events { 'game:despawned': number } }

export interface DespawnOptions { flush_rate: number }

export const system: System<DespawnOptions> = {
  id: 'game:despawn' as const,
  options: { flush_rate: 60 },
  tick: async (game, _delta, options) => {
    if (game.frame % options.flush_rate !== 0) return

    game.flush()
  }
}

export default system
