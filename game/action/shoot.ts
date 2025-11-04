import type { Action } from '@/game/config/action'
import { ACTION_TYPE } from '@/game/config/action'
import type { State } from '@/game/utility/input'

declare module '@/game/config/action' {
  interface Actions {
    shoot: ShootAction
  }
}

export type ShootAction = State

export const action: Action<'shoot'> = {
  id: 'shoot',
  type: ACTION_TYPE.ACTIVATED,
  startup_duration: 0,
  active_duration: 100,
  recovery_duration: 100,
  cooldown_duration: 300,
  energy_cost: 4,
  
  on_active: (ctx) => {
    const position = ctx.game.get(ctx.entity, 'position')

    if (!position) return

    const params = ctx.params as State

    if (!params) return
    
    const target_x = params.MOUSE_X
    const target_y = params.MOUSE_Y
    
    const dx = target_x - position.x
    const dy = target_y - position.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance === 0) return
    
    const direction_x = dx / distance
    const direction_y = dy / distance
    
    const speed = 10.0
    const projectile_entity = ctx.game.spawn()
    
    ctx.game.add(projectile_entity, 'sync')
    
    ctx.game.add(projectile_entity, 'position', { 
      x: position.x + direction_x * 25,
      y: position.y + direction_y * 25
    })

    ctx.game.add(projectile_entity, 'velocity', { 
      x: direction_x * speed,
      y: direction_y * speed
    })

    ctx.game.add(projectile_entity, 'rotation', { value: Math.atan2(dy, dx) })

    ctx.game.add(projectile_entity, 'projectile', {
      owner: ctx.entity,
      damage: 10.0,
      lifetime: 3000.0,
      spawned_at: performance.now()
    })
    
    ctx.game.collider.spawn('circle', projectile_entity, {
      radius: 5,
      x: position.x + direction_x * 25,
      y: position.y + direction_y * 25,
      options: {
        isSensor: true,
        isStatic: false,
      }
    })
  }
}

export default action

