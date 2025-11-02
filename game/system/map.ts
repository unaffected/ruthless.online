import { type System } from '@/game'
import Matter from 'matter-js'
import physics from '@/game/system/physics'

declare module '@/game' { 
  interface Game {
    map: {
      container: any
      walls: any[]
      width: number
      height: number
      grid: number
    }
  }
}

export const system: System = {
  id: 'game:map' as const,
  dependencies: [physics],
  install: async (game) => {
    const { width, height } = game.config.map
    const { COLLISION_FILTER } = game.config.collision
    
    const wallThickness = 32
    
    const walls = [
      // Top wall
      Matter.Bodies.rectangle(
        0,
        -height / 2 - wallThickness / 2,
        width,
        wallThickness,
        {
          isStatic: true,
          collisionFilter: COLLISION_FILTER.WALL,
          label: 'wall:top'
        }
      ),
      
      // Bottom wall
      Matter.Bodies.rectangle(
        0,
        height / 2 + wallThickness / 2,
        width,
        wallThickness,
        {
          isStatic: true,
          collisionFilter: COLLISION_FILTER.WALL,
          label: 'wall:bottom'
        }
      ),
      
      // Left wall
      Matter.Bodies.rectangle(
        -width / 2 - wallThickness / 2,
        0,
        wallThickness,
        height,
        {
          isStatic: true,
          collisionFilter: COLLISION_FILTER.WALL,
          label: 'wall:left'
        }
      ),
      
      // Right wall
      Matter.Bodies.rectangle(
        width / 2 + wallThickness / 2,
        0,
        wallThickness,
        height,
        {
          isStatic: true,
          collisionFilter: COLLISION_FILTER.WALL,
          label: 'wall:right'
        }
      ),
    ]
    
    Matter.Composite.add(game.physics.engine.world, walls)
    
    game.map = {
      container: null,
      walls,
      width,
      height,
      grid: game.config.map.grid
    }
  },
}

export default system

