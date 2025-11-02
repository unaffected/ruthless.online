declare module '@/game' { interface Components { velocity: typeof component }}

export const id = 'velocity' as const

export const component = {
  x: new Float32Array([]),
  y: new Float32Array([])
}

