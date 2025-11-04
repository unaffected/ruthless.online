import { STAT } from '@/game/system/stat'
import type { Component } from '@/game'

export function get_stat_id(stat: string): number {
  switch (stat) {
    case 'health_current': return STAT.HEALTH_CURRENT
    case 'health_maximum': return STAT.HEALTH_MAXIMUM
    case 'health_regeneration': return STAT.HEALTH_REGENERATION
    case 'energy_current': return STAT.ENERGY_CURRENT
    case 'energy_maximum': return STAT.ENERGY_MAXIMUM
    case 'energy_regeneration': return STAT.ENERGY_REGENERATION
    case 'speed': return STAT.SPEED
    default: return -1
  }
}

export function get_base_stat(stats: Component<'stats'>, stat: string): number {
  switch (stat) {
    case 'health_current': return stats.health_current
    case 'health_maximum': return stats.health_maximum
    case 'health_regeneration': return stats.health_regeneration
    case 'energy_current': return stats.energy_current
    case 'energy_maximum': return stats.energy_maximum
    case 'energy_regeneration': return stats.energy_regeneration
    case 'speed': return stats.speed
    default: return 0
  }
}

