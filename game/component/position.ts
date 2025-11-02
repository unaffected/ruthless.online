import { f32 } from 'bitecs/serialization'

declare module '@/game' { interface Components { position: typeof component }}

export const id = 'position' as const

export const component = {
  x: f32([]),
  y: f32([]),
} as const

