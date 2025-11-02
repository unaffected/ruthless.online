import { type System } from '@/game'
import network from '@/client/system/network'
import collider from '@/game/system/collider'

declare module '@/game' { 
  interface Game {
    active_player: () => boolean
    is_local_player: (entity: number) => boolean
  }
}

export const system: System = {
  id: 'client:player' as const,
  dependencies: [network, collider],
  install: async (game) => {
    game.active_player = () => (typeof game.entity === 'number')
    game.is_local_player = (entity) => (game.active_player() && entity === game.entity)

    game.on('client:player:connected', () => {
      console.debug('[client:player] connected to server')
      
      game.collider.spawn('circle', game.entity, {
        radius: 20,
        options: {
          collisionFilter: game.config.collision.COLLISION_FILTER.PLAYER,
          isStatic: false,
          isSleeping: false,
          sleepThreshold: Infinity,
          friction: 0,
          frictionAir: 0,
          frictionStatic: 0,
          restitution: 0,
          inertia: Infinity,
        }
      })
    })
  },
  tick: async (game) => {
    if (!game.active_player()) return

    if (game.prediction?.enabled && game.prediction.snapshot) {
      const server: any = {}
      
      for (const [name] of Object.entries(game.components)) {
        if (game.has(game.entity, name as any)) {
          const data = game.get(game.entity, name as any)

          if (!data) continue

          server[name] = { ...data }
        }
      }
      
      game.prediction.snapshot = server
      game.prediction.last_server_sequence = game.input.sequence
    } else if (game.prediction?.enabled) {
      const server: any = {}
      
      for (const [name] of Object.entries(game.components)) {
        if (game.has(game.entity, name as any)) {
          const data = game.get(game.entity, name as any)

          if (!data) continue

          server[name] = { ...data }
        }
      }
      
      game.prediction.snapshot = server
    }
  }
}

export default system
