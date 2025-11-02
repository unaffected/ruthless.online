import { type System } from '@/game'
import event from '@/game/system/event'

declare module '@/game' {
  interface Game {
    grid: {
      cell_size: number
      cell_radius: number
      entities: Map<number, string>
      state: Map<string, Set<number>>
      key: (x: number, y: number) => string
      load: (x: number, y: number, radius?: number) => number[]
      update: (entity: number) => void
      remove: (entity: number) => void
    }
  }
}

export const system: System = {
  id: 'server:grid',
  dependencies: [event],
  install: async (game) => {
    const cell_size = game.option('grid_cell_size', 500)
    const cell_radius = game.option('grid_load_radius', 1)
    
    game.grid = {
      cell_size,
      cell_radius,
      entities: new Map(),
      state: new Map(),
      
      key: (x, y) => {
        const grid_x = Math.floor(x / cell_size)
        const grid_y = Math.floor(y / cell_size)

        return `${grid_x},${grid_y}`
      },
      
      load: (x, y, radius?: number) => {
        const center_x = Math.floor(x / cell_size)
        const center_y = Math.floor(y / cell_size)
        
        const entities: number[] = []

        radius ??= cell_radius
        
        for (let dx = -radius; dx <= radius; dx++) {
          for (let dy = -radius; dy <= radius; dy++) {
            const key = `${center_x + dx},${center_y + dy}`
            const cell = game.grid.state.get(key)
            if (cell) entities.push(...cell)
          }
        }
        
        return entities
      },
      
      update: (entity) => {
        const pos = game.get(entity, 'position')
        if (!pos) return
        
        const new_key = game.grid.key(pos.x, pos.y)
        const old_key = game.grid.entities.get(entity)
        
        if (old_key === new_key) return
        
        if (old_key) {
          const old_cell = game.grid.state.get(old_key)

          if (old_cell) {
            old_cell.delete(entity)

            if (old_cell.size === 0) game.grid.state.delete(old_key)
          }
        }
        
        let new_cell = game.grid.state.get(new_key)

        if (!new_cell) {
          new_cell = new Set()
          game.grid.state.set(new_key, new_cell)
        }

        new_cell.add(entity)
        game.grid.entities.set(entity, new_key)
      },
      
      remove: (entity) => {
        const key = game.grid.entities.get(entity)

        if (!key) return
        
        const cell = game.grid.state.get(key)

        if (cell) {
          cell.delete(entity)

          if (cell.size === 0) game.grid.state.delete(key)
        }
        
        game.grid.entities.delete(entity)
      }
    }
    
    game.on('server:player:disconnected', (connection) => {
      const entity = game.connections.get(connection)

      if (!entity) return

      game.grid.remove(entity)
    })
  },
  
  tick: async (game) => {
    const entities = game.query([
      game.components.sync,
      game.components.position,
    ])
    
    for (const entity of entities) {
      game.grid.update(entity)
    }
  }
}

export default system

