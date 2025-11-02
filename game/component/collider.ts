import { u8 } from 'bitecs/serialization'

declare module '@/game' { interface Components { collider: typeof component }}

export const id = 'collider' as const

export const component = {
  type: u8([]),
} as const

