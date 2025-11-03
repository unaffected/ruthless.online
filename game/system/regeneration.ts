import { type System } from '@/game'

export const system: System = {
  id: 'game:regeneration' as const,
  tick: async (game, delta) => {
    const entities = game.query({
      any: ['health', 'energy']
    })
    
    const delta_seconds = delta / 1000
    
    for (const entity of entities) {
      const health = game.get(entity, 'health')
      const energy = game.get(entity, 'energy')
      
      if (health && health.current < health.maximum) {
        game.set(entity, 'health', { current: Math.min(health.maximum, health.current + health.regeneration * delta_seconds) })
      }
      
      if (energy && energy.current < energy.maximum) {
        game.set(entity, 'energy', { current: Math.min(energy.maximum, energy.current + energy.regeneration * delta_seconds) })
      }
    }
  }
}

export default system

