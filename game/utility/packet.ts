import { pack, unpack, type State } from '@/game/utility/input'

export interface Packets {
  SNAPSHOT: ArrayBuffer
  SYNC: ArrayBuffer
  UPDATE: ArrayBuffer
  CONNECTED: Uint32Array
  INPUT: { state: State, sequence: number }
}

export type Packet = typeof PACKET[keyof typeof PACKET]

export const PACKET = {
  SNAPSHOT: 0 as const,
  SYNC: 1 as const,
  UPDATE: 2 as const,
  CONNECTED: 3 as const,
  INPUT: 4 as const,
} as const

export const make = (type: Packet, data: ArrayBuffer) => {
  const message = new Uint8Array(data.byteLength + 1)

  message[0] = type
  message.set(new Uint8Array(data), 1)

  return message.buffer
}

export const parse = (data: ArrayBuffer) => {
  const buffer = new Uint8Array(data)

  return {
    type: buffer[0] as Packet,
    data: buffer.slice(1).buffer,
  }
}

export const input = {
  encode: (state: Partial<State>, sequence: number): ArrayBuffer => {
    const buffer = new ArrayBuffer(7)
    const view = new DataView(buffer)
    
    view.setUint8(0, PACKET.INPUT)
    view.setUint16(1, pack(state), true)
    view.setUint32(3, sequence, true)
    
    return buffer
  },
  
  decode: (view: DataView, offset: number = 1): Packets['INPUT'] => {
    return {
      state: unpack(view.getUint16(offset, true)),
      sequence: view.getUint32(offset + 2, true),
    }
  }
}