declare module '@/game' { interface Components { collider: typeof component }}

export const id = 'collider' as const

export const SHAPE = {
  CIRCLE: 0,
  BOX: 1,
} as const

export const component = {
  type: new Uint8Array([])
}

