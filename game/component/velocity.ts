import { f32 } from 'bitecs/serialization'

declare module '@/game' { interface Components { velocity: typeof component }}

export const id = 'velocity' as const

export const component = {
  x: f32([]),
  y: f32([]),
} as const

