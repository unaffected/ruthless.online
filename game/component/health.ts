declare module '@/game' { interface Components { health: typeof component }}

export const id = 'health' as const

export const component = {
  current: new Float32Array([]),
  maximum: new Float32Array([])
}

