import { type Game, type System } from '@/game'
import Matter from 'matter-js'
import colliders from '@/game/collider'

declare module '@/game' { 
  interface Game {
    collider: {
      bodies: Map<number, Matter.Body>
      registry: Map<string, Collider>
      types: Map<number, Collider>
      spawn: <K extends keyof Colliders>(type: K, entity: number, options: Colliders[K]) => Matter.Body
      despawn: (entity: number) => void
    }
  }
}

export type COLLIDER = keyof Colliders

export interface Colliders {}

export type Collider<K extends COLLIDER = COLLIDER> = {
  id: K
  type: number
  spawn: (game: Game, entity: number, options: Colliders[K]) => Matter.Body
  despawn?: (game: Game, entity: number, body: Matter.Body) => void
  tick?: (game: Game, entity: number, body: Matter.Body) => void
}

export const system: System = {
  id: 'game:collider' as const,
  dependencies: [],
  install: async (game) => {
    game.collider = {
      bodies: new Map(),
      registry: new Map(),
      types: new Map(),
      
      spawn: (type, entity, options) => {
        const manager = game.collider.registry.get(type)
        
        if (!manager) {
          console.warn(`[game:collider] Collider '${type}' not found`)
          return null as any
        }
        
        const body = manager.spawn(game, entity, options)
        
        game.collider.bodies.set(entity, body)
        
        game.add(entity, 'collider', { type: manager.type })
        
        return body
      },
      
      despawn: (entity) => {
        const body = game.collider.bodies.get(entity)
        
        if (!body) return
        
        const component = game.get(entity, 'collider')
        
        if (!component) return
        
        const collider = game.collider.types.get(component.type)
        
        if (collider?.despawn) {
          collider.despawn(game, entity, body)
        }
        
        game.collider.bodies.delete(entity)
        game.remove(entity, 'collider')
      },
    }

    colliders.forEach((collider) => { 
      game.collider.registry.set(collider.id, collider as Collider)
      game.collider.types.set(collider.type, collider as Collider)
    })
  },
  tick: async (game) => {
    const entities = game.query([game.components.collider])
    
    for (const entity of entities) {
      const body = game.collider.bodies.get(entity)
      const component = game.get(entity, 'collider')
      
      if (!body || !component) continue
      
      const collider = game.collider.types.get(component.type)
      
      if (collider?.tick) {
        collider.tick(game, entity, body)
      }
    }
  }
}

export default system

