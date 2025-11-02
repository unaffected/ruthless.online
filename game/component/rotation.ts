import { f32 } from 'bitecs/serialization'

declare module '@/game' { interface Components { rotation: typeof component }}

export const id = 'rotation' as const

export const component = {
  value: f32([]),
} as const

