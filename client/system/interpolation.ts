import { type System } from '@/game'
import network from '@/client/system/network'

declare module '@/game/system/event' { interface Events {} }

declare module '@/game' { 
  interface Game {
    interpolation: {
      enabled: boolean
      speed: number
      snap_threshold: number
      rollback_threshold: number
      states: Map<number, {
        previous_x: number
        previous_y: number
        target_x: number
        target_y: number
        current_x: number
        current_y: number
      }>
    }
  }
}

export const system: System = {
  id: 'client:interpolation' as const,
  dependencies: [network],
  install: async (game) => {
    game.interpolation = {
      enabled: game.option('interpolation_enabled', true),
      speed: game.option('interpolation_speed', 0.25),
      snap_threshold: game.option('interpolation_snap_threshold', 0.5),
      rollback_threshold: game.option('interpolation_rollback_threshold', 100.0),
      states: new Map(),
    }
  },
  tick: async (game) => {
    if (!game.interpolation.enabled) return

    const entities = game.query([game.components.position])
    const positions = game.components.position
    const pos_x = positions.x
    const pos_y = positions.y

    for (const entity of entities) {
      const idx = entity & 0xFFFFF
      const x = pos_x[idx]!
      const y = pos_y[idx]!

      let state = game.interpolation.states.get(entity)

      if (!state) {
        game.interpolation.states.set(entity, {
          previous_x: x,
          previous_y: y,
          target_x: x,
          target_y: y,
          current_x: x,
          current_y: y,
        })
        continue
      }

      if (state.target_x !== x || state.target_y !== y) {
        state.previous_x = state.current_x
        state.previous_y = state.current_y
        state.target_x = x
        state.target_y = y
      }

      const dx = state.target_x - state.current_x
      const dy = state.target_y - state.current_y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > game.interpolation.rollback_threshold) {
        state.current_x = state.target_x
        state.current_y = state.target_y
        console.warn(`[client:interpolation] rollback: #${entity} - ${distance.toFixed(2)}px`)
        continue
      }

      if (distance < game.interpolation.snap_threshold) continue

      state.current_x += dx * game.interpolation.speed
      state.current_y += dy * game.interpolation.speed
    }

    for (const [entity] of game.interpolation.states) {
      if (!entities.includes(entity)) {
        game.interpolation.states.delete(entity)
      }
    }
  }
}

export default system

