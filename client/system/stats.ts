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
    
    const health = game.get(game.entity, 'health')
    const energy = game.get(game.entity, 'energy')
    
    if (!health && !energy) return
    
    game.emit('client:player:stats', {
      health_current: health?.current ?? 0,
      health_maximum: health?.maximum ?? 0,
      energy_current: energy?.current ?? 0,
      energy_maximum: energy?.maximum ?? 0
    })
  }
}

export default system

