import { ACTION_TYPE, type Action } from '@/game/config/action'

declare module '@/game/config/action' { interface Actions { regeneration: never } }

export const action: Action<'regeneration'> = {
  id: 'regeneration',
  type: ACTION_TYPE.PASSIVE,
  
  on_tick: (ctx) => {    
    const stats = ctx.game.get(ctx.entity, 'stats')

    if (!stats) return
    
    const delta_seconds = ctx.delta / 1000
    
    let needs_update = false

    const updates: Partial<typeof stats> = {}
    
    if (stats.health_current < stats.health_maximum) {
      updates.health_current = Math.min(
        stats.health_maximum,
        stats.health_current + stats.health_regeneration * delta_seconds
      )

      needs_update = true
    }
    
    if (stats.energy_current < stats.energy_maximum) {
      updates.energy_current = Math.min(
        stats.energy_maximum,
        stats.energy_current + stats.energy_regeneration * delta_seconds
      )

      needs_update = true
    }
    
    if (needs_update) ctx.game.set(ctx.entity, 'stats', updates)
  }
}

export default action

