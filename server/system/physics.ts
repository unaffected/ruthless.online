import { type System } from '@/game'
import Matter from 'matter-js'

declare module '@/game' { interface Game { physics: { engine: Matter.Engine } } }

export const system: System<Matter.IEngineDefinition> = {
  id: 'server:physics' as const,
  dependencies: [],
  options: { gravity: { x: 0, y: 0 } },
  install: async (game, options) => { 
    game.physics = { engine: Matter.Engine.create(options) } 
  },
  tick: async (game, delta) => { 
    Matter.Engine.update(game.physics.engine, delta) 
  },
}

export default system

