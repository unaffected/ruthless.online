import { type Game, type System } from '@/game'
import type { Graphics as PixiGraphics, Sprite } from 'pixi.js'
import graphics from '@/client/graphic'
import network from '@/client/system/network'

export type GRAPHIC = keyof Graphics

export interface Graphics {}

export type Graphic<K extends GRAPHIC = GRAPHIC> = {
  id: K
  spawn: (game: Game, entity: number, options?: Graphics[K]) => PixiGraphics | Sprite
  despawn?: (game: Game, entity: number, graphic: PixiGraphics | Sprite) => void
  tick?: (game: Game, entity: number, graphic: PixiGraphics | Sprite) => void
}

declare module '@/game' { 
  interface Game {
    graphics: Map<number, {
      type: string
      graphic: PixiGraphics | Sprite
    }>
    graphic: {
      spawn: <K extends keyof Graphics>(type: K, entity: number, options?: Graphics[K]) => PixiGraphics | Sprite
      despawn: (entity: number) => void
      tick: () => void
      registry: Map<string, Graphic>
    }
  }
}

export const system: System = {
  id: 'client:graphic' as const,
  dependencies: [network],
  install: async (game) => {
    game.graphics = new Map()
    
    game.graphic = {
      registry: new Map(),
      
      spawn: (type, entity, options) => {
        const def = game.graphic.registry.get(type)
        
        if (!def) {
          console.warn(`[graphic] Graphic '${type}' not found`)
          return null as any
        }
        
        const graphic = def.spawn(game, entity, options)
        
        game.graphics.set(entity, {
          type,
          graphic,
        })
        
        return graphic
      },
      
      despawn: (entity) => {
        const entry = game.graphics.get(entity)
        
        if (!entry) return
        
        const def = game.graphic.registry.get(entry.type)
        
        if (def?.despawn) {
          def.despawn(game, entity, entry.graphic)
        }
        
        game.graphics.delete(entity)
      },
      
      tick: () => {
        for (const [entity, entry] of game.graphics) {
          const def = game.graphic.registry.get(entry.type)
          
          if (def?.tick) {
            def.tick(game, entity, entry.graphic)
          }
        }
      }
    }

    graphics.forEach((graphic) => { game.graphic.registry.set(graphic.id, graphic) })

    console.debug('[client:graphic] initialized')
  }
}

export default system

