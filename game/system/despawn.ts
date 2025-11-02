import { type System } from '@/game'


export const system: System = {
  id: 'game:despawn' as const,
  tick: async (game) => {
    if (game.frame % 60 !== 0) return

    game.flush()
  }
}

export default system
