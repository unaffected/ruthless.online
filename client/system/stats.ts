import { type System } from '@/game'

declare module '@/game/system/event' {
  interface Events {
    'client:player:stats': {
      health_current: number
      health_maximum: number
      energy_current: number
      energy_maximum: number
    }
  }
}

export const system: System = {
  id: 'client:stats' as const,
  tick: async (game) => {
    if (!game.active_player()) return
    
    const stats = game.get(game.entity, 'stats')

    if (!stats) return
    
    game.emit('client:player:stats', stats)
  }
}

export default system

