import { u32 } from 'bitecs/serialization'

declare module '@/game' { interface Components { input: typeof component }}

export const id = 'input' as const

export const component = {
  packed: u32([]),
  sequence: u32([]),
} as const

