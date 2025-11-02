declare module '@/game' { interface Components { input: typeof component }}

export const id = 'input' as const

export const component = {
  packed: new Uint32Array([]),
  sequence: new Uint32Array([])
}

