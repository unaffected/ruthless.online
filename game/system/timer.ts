import { type System } from '@/game'

declare module '@/game' { 
  interface Game {
    timers: Map<string, Timer>
    timer: ((callback: (...args: any) => void, expiration: number) => Timer)
    wait: (duration: number) => Promise<boolean>
  }
}

export type Timer = {
  id: string
  callback: (timer: Timer) => void
  cancel: () => void
  created_at: number
  expires_at: number
  expiration: number
  reset: () => void
  timeout: NodeJS.Timeout | number | null
}

export const system: System = {
  id: 'timer' as const,
  install: async (game) => {
    game.timers = new Map<string, Timer>()

    game.timer = (callback: (...args: any) => void, expiration: number) => {
      const id = Math.random().toString(36).substring(2, 15)
      const created_at = Date.now()
      const expires_at = created_at + expiration

      const timeout = setTimeout(() => {
        try {
          callback(timer)
        } catch (error) {
          console.error(error)
        } finally {
          game.timers.delete(id)
        }
      }, expiration)
    
      const cancel = () => clearTimeout(timeout)
    
      const reset = () => {
        timer.cancel()
    
        return game.timer(timer.callback, timer.expiration)
      }
    
      const timer: Timer = {
        id,
        callback,
        cancel,
        created_at,
        expiration,
        expires_at,
        timeout,
        reset,
      }
    
      game.timers.set(id, timer)

      return timer
    }

    game.wait = async (duration: number = 0) => new Promise((resolve) => {
      setTimeout(() => { resolve(true) }, duration)
    })
  }
}

export default system