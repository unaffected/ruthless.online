declare module '@/game' { interface Components { energy: typeof component }}

export const id = 'energy' as const

export const component = {
  current: new Float32Array([]),
  maximum: new Float32Array([]),
  regeneration: new Float32Array([])
}

