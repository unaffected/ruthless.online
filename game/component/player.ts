import { f32 } from 'bitecs/serialization'

declare module '@/game' { interface Components { player: typeof component }}

export const id = 'player' as const

export const component = {
  health_current: f32([]),
  health_max: f32([]),
  movement_speed: f32([]),
  position_x: f32([]),
  position_y: f32([]),
  velocity_x: f32([]),
  velocity_y: f32([]),
  rotation: f32([]),
} as const
