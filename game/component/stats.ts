declare module '@/game' {
  interface Components {
    stats: typeof component
  }
}

export const id = 'stats' as const

export const component = {
  health_current: new Float32Array([]),
  health_maximum: new Float32Array([]),
  health_regeneration: new Float32Array([]),
  energy_current: new Float32Array([]),
  energy_maximum: new Float32Array([]),
  energy_regeneration: new Float32Array([]),
  speed: new Float32Array([]),
}

