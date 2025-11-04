declare module '@/game' {
  interface Components {
    burst: typeof component
  }
}

export const id = 'burst' as const

export const component = {
  active: new Uint8Array([])
}

