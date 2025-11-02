import { f32 } from 'bitecs/serialization'

declare module '@/game' { interface Components { movement: typeof component }}

export const id = 'movement' as const

export const component = {
  speed: f32([]),
} as const

