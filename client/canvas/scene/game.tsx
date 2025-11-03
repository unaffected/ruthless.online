import { useState } from 'react'
import { game, useGameEvent } from '@/client/canvas/utility/game'
import HealthWidget from '@/client/canvas/widget/player/health'
import EnergyWidget from '@/client/canvas/widget/player/energy'

export function GameScene() {
  const [is_active, set_is_active] = useState(game.active_player())
  
  useGameEvent('client:player:connected', () => {
    set_is_active(true)
  })
  
  return (
    <div className="fixed top-5 left-5 flex flex-col gap-2.5 pointer-events-none">
      {is_active ? (
        <>
          <HealthWidget />
          <EnergyWidget />
        </>
      ) : (
        <div className="text-white text-xs opacity-50">Connecting...</div>
      )}
    </div>
  )
}

export default GameScene

