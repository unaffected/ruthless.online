declare module '@/game' { interface Components { input: typeof component }}

export const id = 'input' as const

export const component = {
  packed: new Uint32Array([]),
  sequence: new Uint32Array([]),
  mouse_x: new Int16Array([]),
  mouse_y: new Int16Array([])
}

