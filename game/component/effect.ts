declare module '@/game' {
  interface Components {
    effect: typeof component
  }
}

export const id = 'effect' as const

export const component = {
  type: new Uint8Array([]),
  target: new Uint32Array([]),
  applied_at: new Float32Array([]),
  expires_at: new Float32Array([]),
  source: new Uint32Array([]),
  stat: new Uint8Array([]),
  operation: new Uint8Array([]),
  value: new Float32Array([]),
  priority: new Uint8Array([])
}

export const EFFECT_TYPE = {
  MODIFIER: 0,
  DAMAGE_OVER_TIME: 1,
  HEAL_OVER_TIME: 2,
  DAMAGE: 3,
} as const

export type EffectType = typeof EFFECT_TYPE[keyof typeof EFFECT_TYPE]
