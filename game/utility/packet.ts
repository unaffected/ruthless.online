import { pack, unpack, type State } from '@/game/utility/input'

export type Packet = typeof PACKET[keyof typeof PACKET]

export const PACKET = {
  ENTITIES: 0 as const,
  CONNECTED: 1 as const,
  INPUT: 2 as const,
  POSITION: 10 as const,
  VELOCITY: 11 as const,
  ROTATION: 12 as const,
  HEALTH: 13 as const,
  MOVEMENT: 14 as const,
  ENERGY: 15 as const,
} as const

export const input = {
  encode: (state: Partial<State>, sequence: number): ArrayBuffer => {
    const buffer = new ArrayBuffer(7)
    const view = new DataView(buffer)
    
    view.setUint8(0, PACKET.INPUT)
    view.setUint16(1, pack(state), true)
    view.setUint32(3, sequence, true)
    
    return buffer
  },
  
  decode: (view: DataView, offset: number = 1): { state: State, sequence: number } => {
    return {
      state: unpack(view.getUint16(offset, true)),
      sequence: view.getUint32(offset + 2, true),
    }
  }
}