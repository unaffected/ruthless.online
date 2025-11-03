import { useState } from 'react'
import { useGameEvent } from '@/client/canvas/utility/game'

export function HealthWidget() {
  const [health, setHealth] = useState({ current: 100, maximum: 100 })
  
  useGameEvent('client:player:stats', (data) => {
    setHealth({
      current: data.health_current,
      maximum: data.health_maximum
    })
  })
  
  const percentage = Math.max(0, Math.min(100, (health.current / health.maximum) * 100))
  
  return (
    <div className="flex flex-col gap-1.5 w-[200px]">
      <div className="text-[10px] font-bold uppercase tracking-wide text-white" style={{
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6)'
      }}>
        Health
      </div>
      
      <div className="relative h-6 border border-white/15 rounded overflow-hidden">
        <div className="absolute inset-0 bg-black/80">
          <div 
            className="absolute top-0 left-0 h-full transition-[width] duration-300 ease-out"
            style={{
              width: `${percentage}%`,
              background: 'linear-gradient(to bottom, #ac1717, #710606)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          />
          
          <div className="absolute top-0 left-0 w-full h-full flex pointer-events-none">
            {Array.from({ length: 100 }).map((_, index) => (
              <div
                key={index}
                className="flex-1 border-r border-black/30"
                style={{
                  borderRightWidth: index % 10 === 9 ? '1px' : '1px',
                  borderRightColor: index % 10 === 9 ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)'
                }}
              />
            ))}
          </div>
        </div>
        
        <div 
          className="absolute top-1/2 left-1/2 text-sm font-medium text-white whitespace-nowrap pointer-events-none"
          style={{
            transform: 'translate(-50%, -50%)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 1), 0 0 4px rgba(0, 0, 0, 0.8)',
            zIndex: 10
          }}
        >
          {Math.ceil(health.current)} / {health.maximum}
        </div>
      </div>
    </div>
  )
}

export default HealthWidget

