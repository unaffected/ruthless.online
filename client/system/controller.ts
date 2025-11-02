import { type System } from '@/game'
import { INPUT, pack, type State } from '@/game/utility/input'
import * as packet from '@/game/utility/packet'
import { load, save, type Mapping } from '@/client/utility/input'
import network from '@/client/system/network'

declare module '@/game/system/event' {
  interface Events {
    'client:controller:ready': void
    'client:controller:tick': { packed: number }
    'client:controller:input': { packed: number, sequence: number }
    'client:controller:save': Mapping
    'client:controller:load': Mapping
  }
}

declare module '@/game' { 
  interface Game {
    input: {
      state: State
      mapping: Mapping
      packed: number
      last_packed: number
      sequence: number
      last_sent: number
      last_changed: number
      throttle_rate: number
      keepalive_rate: number
      pressed: Set<string>
    }
  }
}

export const system: System = {
  id: 'client:controller' as const,
  dependencies: [network],
  install: async (game) => {
    const throttle_rate = game.option('input_throttle_rate', 30)

    game.input = {
      state: {} as State,
      mapping: load(),
      packed: 0,
      last_packed: 0,
      sequence: 0,
      last_sent: 0,
      last_changed: 0,
      throttle_rate,
      keepalive_rate: game.option('input_keepalive_rate', 1000),
      pressed: new Set<string>(),
    }

    for (const key of Object.keys(INPUT)) {
      game.input.state[key as keyof typeof INPUT] = false
    }

    const clear = () => {
      for (const key of Object.keys(INPUT)) {
        game.input.state[key as keyof typeof INPUT] = false
      }

      game.input.pressed.clear()
      
      if (game.socket && game.socket.readyState === WebSocket.OPEN) {
        game.input.sequence = (game.input.sequence + 1) >>> 0
        game.input.packed = pack(game.input.state)
        game.socket.send(packet.input.encode(game.input.state, game.input.sequence))
        game.input.last_sent = performance.now()
        game.input.last_packed = game.input.packed
        console.debug('[client:controller] input cleared and sent')
      }
    }

    window.addEventListener('blur', () => { clear() })
    document.addEventListener('visibilitychange', () => { if (document.hidden) { clear() } })

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      game.input.pressed.add(event.code)

      for (const [button, keys] of Object.entries(game.input.mapping.keyboard)) {
        if (keys && keys.includes(event.code)) {
          game.input.state[button as keyof typeof INPUT] = true
          event.preventDefault()
        }
      }
    })

    window.addEventListener('keyup', (event: KeyboardEvent) => {
      game.input.pressed.delete(event.code)

      for (const [button, keys] of Object.entries(game.input.mapping.keyboard)) {
        if (keys && keys.includes(event.code)) {
          game.input.state[button as keyof typeof INPUT] = false
          event.preventDefault()
        }
      }
    })

    game.on('client:controller:save', (mapping: Mapping) => {
      game.input.mapping = mapping
      save(mapping)
    })

    game.emit('client:controller:ready')
  },
  tick: async (game) => {
    const gamepads = navigator.getGamepads()
    
    for (const gamepad of gamepads) {
      if (!gamepad) continue

      const mapping = game.input.mapping.gamepad

      for (const [button, indices] of Object.entries(mapping.buttons)) {
        if (!indices) continue

        let pressed = false

        for (const index of indices) {
          if (gamepad.buttons[index]?.pressed) {
            pressed = true
            break
          }
        }

        game.input.state[button as keyof typeof INPUT] = game.input.state[button as keyof typeof INPUT] || pressed
      }

      if (mapping.axes) {
        const deadzone = mapping.axes.deadzone ?? 0.2
        
        if (mapping.axes.horizontal !== undefined) {
          const horizontal = gamepad.axes[mapping.axes.horizontal] ?? 0
          
          if (horizontal < -deadzone) {
            game.input.state.LEFT = true
          } else if (horizontal > deadzone) {
            game.input.state.RIGHT = true
          }
        }

        if (mapping.axes.vertical !== undefined) {
          const vertical = gamepad.axes[mapping.axes.vertical] ?? 0
          
          if (vertical < -deadzone) {
            game.input.state.UP = true
          } else if (vertical > deadzone) {
            game.input.state.DOWN = true
          }
        }
      }
    }

    game.input.packed = pack(game.input.state)

    game.emit('client:controller:tick', { packed: game.input.packed })

    const now = performance.now()
    const elapsed_since_sent = now - game.input.last_sent
    const throttle_interval = 1000 / game.input.throttle_rate
    const input_changed = game.input.packed !== game.input.last_packed

    if (input_changed) {
      game.input.last_changed = now
    }

    const should_send = false
      || (input_changed && elapsed_since_sent >= throttle_interval) 
      || (elapsed_since_sent >= game.input.keepalive_rate)

    if (should_send && game.socket && game.socket.readyState === WebSocket.OPEN) {
      game.input.sequence = (game.input.sequence + 1) >>> 0
      
      game.socket.send(packet.input.encode(game.input.state, game.input.sequence))
      game.input.last_sent = now
      game.input.last_packed = game.input.packed

      game.emit('client:controller:input', { 
        packed: game.input.packed, 
        sequence: game.input.sequence 
      })
    }
  }
}

export default system

