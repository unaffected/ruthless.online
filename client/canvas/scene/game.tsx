import { useState } from 'react'
import game from '@/client'
import { useGameEvent } from '@/client/canvas/utility/game'
import HealthWidget from '@/client/canvas/widget/player/health'
import EnergyWidget from '@/client/canvas/widget/player/energy'

export function GameScene() {
  const [is_active, set_is_active] = useState(game.active_player())
  
  useGameEvent('client:player:connected', () => { set_is_active(true) })

  if (!is_active) return null

  return (
    <div className="fixed top-5 left-5 flex flex-col gap-2.5 pointer-events-none">
      <HealthWidget />
      <EnergyWidget />
    </div>
  )
}

export default GameScene

