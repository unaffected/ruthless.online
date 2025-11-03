import type { Action } from '@/game/system/action'
import type { State } from '@/game/utility/input'

declare module '@/game/system/action' { interface Actions { shoot: ShootAction } }

export type ShootAction = State

export const action: Action<'shoot'> = {
  id: 'shoot',
  cooldown: 300,
  energy_cost: 3,
  execute: (game, entity, params) => {
    const position = game.get(entity, 'position')
    
    if (!position) return
    
    const target_x = params.MOUSE_X
    const target_y = params.MOUSE_Y
    
    const dx = target_x - position.x
    const dy = target_y - position.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance === 0) return
    
    const direction_x = dx / distance
    const direction_y = dy / distance
    
    const speed = 10.0
    const projectile_entity = game.spawn()
    
    game.add(projectile_entity, 'sync')
    game.add(projectile_entity, 'position', { 
      x: position.x + direction_x * 25,
      y: position.y + direction_y * 25
    })
    game.add(projectile_entity, 'velocity', { 
      x: direction_x * speed,
      y: direction_y * speed
    })
    game.add(projectile_entity, 'rotation', { value: Math.atan2(dy, dx) })
    game.add(projectile_entity, 'projectile', {
      owner: entity,
      damage: 10.0,
      lifetime: 3000.0,
      spawned_at: performance.now()
    })
    
    game.collider.spawn('circle', projectile_entity, {
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

