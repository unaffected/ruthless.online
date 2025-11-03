import { type Game, type System } from '@/game'
import type { Graphics as PixiGraphics, Sprite } from 'pixi.js'
import graphics from '@/client/graphic'
import event from '@/game/system/event'

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
      type: GRAPHIC
      graphic: PixiGraphics | Sprite
    }>
    graphic: {
      spawn: <K extends keyof Graphics>(type: K, entity: number, options?: Graphics[K]) => PixiGraphics | Sprite
      despawn: (entity: number) => void
      tick: () => void
      registry: Map<GRAPHIC, Graphic>
    }
  }
}

export const system: System = {
  id: 'client:graphic' as const,
  dependencies: [event],
  install: async (game) => {
    game.graphics = new Map()
    
    game.graphic = {
      registry: new Map(),
      
      spawn: (type, entity, options) => {
        const manager = game.graphic.registry.get(type)
        
        if (!manager) {
          console.warn(`[graphic] Graphic '${type}' not found`)

          return null as any
        }
        
        const graphic = manager.spawn(game, entity, options)
        
        game.graphics.set(entity, { type, graphic })
        
        return manager
      },
      
      despawn: (entity) => {
        const manager = game.graphics.get(entity)
        
        if (!manager) return
        
        const graphic = game.graphic.registry.get(manager.type)
        
        if (graphic?.despawn) {
          graphic.despawn(game, entity, manager.graphic)
        }
        
        game.graphics.delete(entity)
      },
      
      tick: () => {
        for (const [entity, manager] of game.graphics) {
          const graphic = game.graphic.registry.get(manager.type)
          
          if (graphic?.tick) {
            graphic.tick(game, entity, manager.graphic)
          }
        }
      }
    }

    graphics.forEach((graphic) => { game.graphic.registry.set(graphic.id, graphic as Graphic<typeof graphic.id>) })
    
    game.on('game:despawned', (entity) => { game.graphic.despawn(entity) })
  }
}

export default system

