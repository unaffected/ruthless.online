import { type System, type Component, type COMPONENT, type Game } from '@/game'
import type { State } from '@/game/utility/input'
import controller from '@/client/system/controller'
import network from '@/client/system/network'
import player from '@/client/system/player'

declare module '@/game/system/event' {
  interface Events {
    'client:prediction:reconcile': {
      entity: number
      server_sequence: number
      divergence: number
    }
  }
}

declare module '@/game' { 
  interface Game {
    prediction: {
      enabled: boolean
      history: Prediction[]
      history_size: number
      last_server_sequence: number
      divergence_threshold: number
      interpolation_alpha: number
      snapshot: Snapshot | null
    }
  }
}

type Snapshot = { [key: string]: Component<COMPONENT> }

type Prediction = {
  components: Snapshot
  input: State
  sequence: number
  timestamp: number
}

const snapshot = (game: Game, entity: number): Snapshot => {
  const result: Snapshot = {}
  
  for (const [name] of Object.entries(game.components)) {
    const data = game.get(entity, name as COMPONENT)

    if (!data) continue

    result[name] = { ...data } 
  }
  
  return result
}

const restore = (game: Game, entity: number, snap: Snapshot): void => {
  for (const [name, data] of Object.entries(snap)) {
    game.set(entity, name as COMPONENT, data)
  }
}

const divergence = (a: Snapshot, b: Snapshot): number => {
  let total = 0
  
  for (const [component, data] of Object.entries(a)) {
    const other = b[component]

    if (!other) continue
    
    for (const [key, value] of Object.entries(data)) {
      const otherValue = other[key as keyof typeof other]

      if (typeof value === 'number' && typeof otherValue === 'number') {
        total += Math.abs(value - otherValue)
      }
    }
  }
  
  return total
}

const interpolate = (game: Game, entity: number, server: Snapshot, client: Snapshot, alpha: number): void => {
  const result: Snapshot = {}

  for (const [name, serverData] of Object.entries(server)) {
    const clientData = client[name]

    if (!clientData) continue

    result[name] = { ...clientData }

    for (const [key, serverValue] of Object.entries(serverData)) {
      const clientValue = clientData[key as keyof typeof clientData]

      if (typeof serverValue === 'number' && typeof clientValue === 'number') {
        (result[name] as any)[key] = clientValue + (serverValue - clientValue) * alpha
      }
    }
  }

  restore(game, entity, result)
}

const rollback = (game: Game, entity: number, server: Snapshot, history: Prediction[], lastSeq: number): void => {
  restore(game, entity, server)

  const pending = history.filter(s => s.sequence > lastSeq)
  
  for (const snap of pending) {
    game.action('move', entity, { input: snap.input })
  }
}

export const system: System = {
  id: 'client:prediction' as const,
  dependencies: [controller, network, player],
  install: async (game) => {
    game.prediction = {
      enabled: game.option('prediction_enabled', true),
      history: [],
      history_size: game.option('prediction_buffer_size', 60),
      last_server_sequence: 0,
      divergence_threshold: game.option('prediction_error_threshold', 5.0),
      interpolation_alpha: 0.15,
      snapshot: null,
    }

    game.on('client:controller:input', (data) => {
      if (!game.prediction.enabled || !game.entity) return

      game.prediction.history.push({
        sequence: data.sequence,
        timestamp: performance.now(),
        input: { ...game.input.state },
        components: snapshot(game, game.entity),
      })

      if (game.prediction.history.length > game.prediction.history_size) {
        game.prediction.history.shift()
      }
    })
  },
  tick: async (game) => {
    if (!game.prediction.enabled || !game.entity || !game.prediction.snapshot) return

    const current = snapshot(game, game.entity)
    const delta = divergence(game.prediction.snapshot, current)

    if (delta > game.prediction.divergence_threshold) {
      console.warn(`[client:prediction] large divergence: ${delta.toFixed(2)}, rolling back`)

      rollback(game, game.entity, game.prediction.snapshot, game.prediction.history, game.prediction.last_server_sequence)

      game.emit('client:prediction:reconcile', {
        entity: game.entity,
        server_sequence: game.prediction.last_server_sequence,
        divergence: delta,
      })
    } else if (delta > 0.1) {
      interpolate(game, game.entity, game.prediction.snapshot, current, game.prediction.interpolation_alpha)
    }

    game.prediction.snapshot = null
  }
}

export default system
