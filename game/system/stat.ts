import type { Game, System } from '@/game'
import * as stat_util from '@/game/utility/stat'

export const STAT_OPERATION = {
  ADD: 0,
  MULTIPLY: 1,
  MULTIPLY_ADD: 2,
  OVERRIDE: 3,
} as const

export type StatOperation = typeof STAT_OPERATION[keyof typeof STAT_OPERATION]

export const STAT = {
  HEALTH_CURRENT: 0,
  HEALTH_MAXIMUM: 1,
  HEALTH_REGENERATION: 2,
  ENERGY_CURRENT: 3,
  ENERGY_MAXIMUM: 4,
  ENERGY_REGENERATION: 5,
  SPEED: 6,
} as const

export type Stat = typeof STAT[keyof typeof STAT]

declare module '@/game' {
  interface Game {
    stats: {
      cache: Map<number, Map<string, { value: number, dirty: boolean }>>
      get: (entity: number, stat: string) => number
      invalidate: (entity: number, stat?: string) => void
    }
  }
}

export const system: System = {
  id: 'game:stat',
  dependencies: [],
  
  install: async (game) => {
    game.stats = {
      cache: new Map(),

      get: (entity, stat) => {
        let entity_cache = game.stats.cache.get(entity)
        
        if (!entity_cache) {
          entity_cache = new Map()
          game.stats.cache.set(entity, entity_cache)
        }

        const cached = entity_cache.get(stat)
        
        if (cached && !cached.dirty) return cached.value

        const value = calculate_stat(game, entity, stat)
        
        entity_cache.set(stat, { value, dirty: false })

        return value
      },

      invalidate: (entity, stat) => {
        const cache = game.stats.cache.get(entity)
        
        if (!cache) return

        if (!stat) {
          for (const cached of cache.values()) { cached.dirty = true }

          return
        }

        const cached = cache.get(stat)
        
        if (cached) cached.dirty = true
      }
    }
  }
}

function calculate_stat(game: Game, entity: number, stat: string): number {
  const stats = game.get(entity, 'stats')
  if (!stats) return 0

  const value = stat_util.get_base_stat(stats, stat)
  const stat_id = stat_util.get_stat_id(stat)
  
  if (stat_id === -1) return value

  const effects = game.components.effect
  const entities = game.query([effects])
  
  if (entities.length === 0) return value

  const target_array = effects.target
  const stat_array = effects.stat
  const operation_array = effects.operation
  const value_array = effects.value
  const priority_array = effects.priority
  
  let count = 0
  
  const modifiers: Array<{ operation: number, value: number, priority: number }> = []
  
  for (const effect of entities) {
    const idx = effect & 0xFFFFF
    
    if (target_array[idx] !== entity) continue
    if (stat_array[idx] !== stat_id) continue
    
    modifiers[count++] = {
      operation: operation_array[idx]!,
      value: value_array[idx]!,
      priority: priority_array[idx]!
    }
  }
  
  if (count === 0) return value
  
  modifiers.length = count
  modifiers.sort((a, b) => a.priority - b.priority)
  
  return apply_modifiers(value, modifiers)
}

function apply_modifiers(base: number, mods: Array<{operation: number, value: number}>): number {
  let value = base
  let additive = 0
  
  for (const mod of mods) {
    if (mod.operation === STAT_OPERATION.OVERRIDE) value = mod.value
    else if (mod.operation === STAT_OPERATION.ADD) value += mod.value
    else if (mod.operation === STAT_OPERATION.MULTIPLY_ADD) additive += mod.value
    else if (mod.operation === STAT_OPERATION.MULTIPLY) value *= mod.value
  }
  
  return value * (1 + additive)
}

export default system
