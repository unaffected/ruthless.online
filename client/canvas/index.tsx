import GameScene from '@/client/canvas/scene/game'
import "./index.css"

export function Canvas() {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      <GameScene />
    </div>
  )
}

export default Canvas
