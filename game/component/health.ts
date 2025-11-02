import { f32 } from 'bitecs/serialization'

declare module '@/game' { interface Components { health: typeof component }}

export const id = 'health' as const

export const component = {
  current: f32([]),
  maximum: f32([]),
} as const

