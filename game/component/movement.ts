declare module '@/game' { interface Components { movement: typeof component }}

export const id = 'movement' as const

export const component = {
  speed: new Float32Array([])
}

