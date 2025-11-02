declare module '@/game' { interface Components { rotation: typeof component }}

export const id = 'rotation' as const

export const component = {
  value: new Float32Array([])
}

