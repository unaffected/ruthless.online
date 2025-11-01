import { type System } from '@/game'
import network from '@/client/system/network'

declare module '@/game/system/event' {
  interface Events {}
}

export const system: System = {
  id: 'client:player' as const,
  dependencies: [network],
  install: async (game) => {
    game.on('client:player:connected', () => {
      console.debug('[client:player] connected to server')
    })

    console.debug('[client:player] initialized')
  },
  tick: async (game) => {
    const player = game.get(game.entity, 'player')

    if (!player) return

    if (game.prediction?.enabled && game.prediction.server_snapshot) {
      const server: any = {}
      
      for (const [name] of Object.entries(game.components)) {
        if (game.has(game.entity, name as any)) {
          const data = game.get(game.entity, name as any)

          if (!data) continue

          server[name] = { ...data }
        }
      }
      
      game.prediction.server_snapshot = server
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
      
      game.prediction.server_snapshot = server
    }
  }
}

export default system
