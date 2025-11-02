import { type System } from '@/game'
import timer, { type Timer } from '@/game/system/timer'

declare module '@/game' { 
  interface Game {
    subscriptions: Subscriptions
    emit: <T extends Event>(event: T, data?: Data<T>) => Game
    on: <T extends Event> (type: T, execute: Subscription<T>['execute'], options?: Subscription<T>['options']) => Game
    once: <T extends Event> (type: T, execute: Subscription<T>['execute'], options?: Subscription<T>['options']) => Game
    off: <T extends Event> (type: T, execute?: Subscription<T>['execute']) => Game
  }
}

export interface Events {}

export type Event = keyof Events
export type Data<T extends Event> = Events[T]

export type Subscription<T extends Event> = {
  type: T
  execute: (data: Data<T>) => void | Promise<void>
  options?: {
    expire?: number
    limit?: number
    on_expired?: (subscription: Subscription<T>) => any
    unique?: boolean
  }
}

export type Registration <T extends Event> = Subscription<T> & {
  id?: string
  invocations?: number
  timer?: Timer
}

export type Subscriptions = Array<Registration<Event>>

export const system: System = {
  id: 'game:event' as const,
  dependencies: [timer],
  install: async (game) => {
    game.subscriptions = []

    game.emit = <T extends Event>(event: T, data?: Data<T>) => {
      const triggers = game.subscriptions.map((subscription, idx) => {
        if (subscription.type.toLowerCase() !== event.toLowerCase()) {
          return false
        }

        game.subscriptions[idx]!.invocations = (subscription.invocations ?? 0) + 1

        if (subscription.options?.limit && game.subscriptions[idx]!.invocations >= subscription.options.limit) {
          game.off(event, subscription.execute)
        }

        return new Promise(async (resolve, reject) => {
          try {
            resolve(await subscription.execute(data as Data<T>))
          } catch (error) {
            reject(error)
          }
        })
      }).filter(Boolean)

      Promise.all(triggers).catch(() => {})

      return game
    }

    game.on = <T extends Event>(event: T, execute: Subscription<T>['execute'], options?: Subscription<T>['options']) => {
      options ??= {}

      const subscription = {
        execute,
        id: Math.random().toString(36).substring(2, 15),
        type: event.toLowerCase(),
        options,
      } as Registration<T>
  
      if (options.expire) {
        game.timer(() => {
          game.off(event, subscription.execute)
    
          if (options.on_expired) {
            options.on_expired(subscription)
          }
        }, options.expire)
      }
  
      if (options.unique) {
        game.off(subscription.type)
      }
  
      game.subscriptions.push(subscription as unknown as Registration<Event>)
  
      return game
    }

    game.once = <T extends Event>(event: T, execute: Subscription<T>['execute'], options?: Subscription<T>['options']) => {
      options ??= {}
      options.limit = 1
  
      return game.on(event, execute, options)
    }

    game.off = <T extends Event>(event: T, execute?: Subscription<T>['execute']) => {
      game.subscriptions = game.subscriptions.filter((subscription) => {
        if (subscription.type !== event.toLowerCase()) {
          return true
        }

        subscription.timer?.cancel()
  
        if (execute && subscription.execute !== execute) {
          return true
        }
  
        return false
      })
  
      return game
    }

    console.debug('[game:event] system initialized')
  }
}

export default system