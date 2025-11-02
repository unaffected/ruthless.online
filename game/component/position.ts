declare module '@/game' { interface Components { position: typeof component }}

export const id = 'position' as const

export const component = {
  x: new Float32Array([]),
  y: new Float32Array([])
}

