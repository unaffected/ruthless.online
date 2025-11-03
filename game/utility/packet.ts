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
  PROJECTILE: 16 as const,
} as const

export const input = {
  encode: (state: Partial<State>, sequence: number): ArrayBuffer => {
    const buffer = new ArrayBuffer(11)
    const view = new DataView(buffer)
    
    view.setUint8(0, PACKET.INPUT)
    view.setUint32(1, sequence, true)
    
    const packed_input = pack(state)
    const input_view = new DataView(packed_input)
    
    view.setUint16(5, input_view.getUint16(0, true), true)
    view.setInt16(7, input_view.getInt16(2, true), true)
    view.setInt16(9, input_view.getInt16(4, true), true)
    
    return buffer
  },
  
  decode: (view: DataView, offset: number = 1): { state: State, sequence: number } => {
    const sequence = view.getUint32(offset, true)
    
    const input_buffer = new ArrayBuffer(6)
    const input_view = new DataView(input_buffer)

    input_view.setUint16(0, view.getUint16(offset + 4, true), true)
    input_view.setInt16(2, view.getInt16(offset + 6, true), true)
    input_view.setInt16(4, view.getInt16(offset + 8, true), true)
    
    return {
      state: unpack(input_buffer),
      sequence,
    }
  }
}