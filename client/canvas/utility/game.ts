import { useEffect } from 'react'
import game from '@/client'
import type { Event, Data } from '@/game/system/event'

export { game }

export function useGameEvent<T extends Event>(
  event: T,
  handler: (data: Data<T>) => void
) {
  useEffect(() => {
    game.on(event, handler)
    
    return () => {
      game.off(event, handler)
    }
  }, [event, handler])
}

