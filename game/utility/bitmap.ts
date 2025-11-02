export type Bitmap = {
  bits: BigUint64Array
  capacity: number
}

export const MAP_BITS = 64 as const
export const MAP_SHIFT_BITS = 6 as const
export const MAP_MASK_BITS = 63 as const

export const create = (capacity: number): Bitmap => ({
  bits: new BigUint64Array(Math.ceil(capacity / MAP_BITS)),
  capacity,
})

export const size = (bitmap: Bitmap): number => bitmap.capacity

export const flush = (bitmap: Bitmap): void => { bitmap.bits.fill(0n) }

export const scale = (bitmap: Bitmap, capacity: number): void => {
  if (capacity <= bitmap.capacity) return

  let target = nextPowerOf2(Math.max(capacity, bitmap.capacity + 1))

  const bits = new BigUint64Array(Math.ceil(target / MAP_BITS))

  bits.set(bitmap.bits)

  bitmap.bits = bits
  bitmap.capacity = target
}

export const has = (bitmap: Bitmap, index: number): boolean => {
  if (index >= bitmap.capacity) return false

  return (bitmap.bits[index >> MAP_SHIFT_BITS]! & 1n << BigInt(index & MAP_MASK_BITS)) !== 0n
}

export const set = (bitmap: Bitmap, index: number): void => {
  if (index >= bitmap.capacity) scale(bitmap, index + 1)

  bitmap.bits[index >> MAP_SHIFT_BITS]! |= 1n << BigInt(index & MAP_MASK_BITS)
}

export const clear = (bitmap: Bitmap, index: number): void => {
  if (index >= bitmap.capacity) return

  bitmap.bits[index >> MAP_SHIFT_BITS]! &= ~(1n << BigInt(index & MAP_MASK_BITS))
}

export const clone = (bitmap: Bitmap): Bitmap => ({
  bits: new BigUint64Array(bitmap.bits),
  capacity: bitmap.capacity,
})

export const popcount = (value: bigint): number => {
  return popcount32(Number(value & 0xFFFFFFFFn) >>> 0) 
    + popcount32(Number((value >> 32n) & 0xFFFFFFFFn) >>> 0)
}

export const count = (bitmap: Bitmap, inverse: boolean = false): number => {
  const words = bitmap.bits

  let total = 0

  for (let i = 0, n = words.length; i < n; i++) {
    total += popcount(words[i]!)
  }

  return inverse ? bitmap.capacity - total : total
}

export const each = (bitmap: Bitmap, visit: (index: number) => void): void => {
  const words = bitmap.bits

  for (let i = 0, n = words.length; i < n; i++) {
    let word = words[i]
    if (word === 0n) continue

    const baseIndex = i * MAP_BITS
    
    while (word !== 0n) {
      visit(baseIndex + countTrailingZeros64(word!))
      word! &= word! - 1n
    }
  }
}

export const collect = (bitmap: Bitmap): number[] => {
  const ids: number[] = []

  each(bitmap, (i) => ids.push(i))

  return ids
}

export const andInto = (out: Bitmap, first: Bitmap, second: Bitmap): Bitmap => {
  reserve(out, Math.max(first.capacity, second.capacity))

  const a = first.bits
  const b = second.bits
  const o = out.bits

  o.fill(0n)

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    o[i] = a[i]! & b[i]!
  }

  return out
}

export const orInto = (out: Bitmap, first: Bitmap, second: Bitmap): Bitmap => {
  reserve(out,  Math.max(first.capacity, second.capacity))

  const a = first.bits
  const b = second.bits
  const o = out.bits

  const aLen = a.length
  const bLen = b.length
  const shared = Math.min(aLen, bLen)

  o.fill(0n)
  
  for (let i = 0; i < shared; i++) o[i] = a[i]! | b[i]!
  if (aLen > shared) for (let i = shared; i < aLen; i++) o[i] = a[i]!
  else if (bLen > shared) for (let i = shared; i < bLen; i++) o[i] = b[i]!

  return out
}

export const notInto = (out: Bitmap, first: Bitmap, second: Bitmap): Bitmap => {
  const maxCapacity = Math.max(first.capacity, second.capacity)

  reserve(out, maxCapacity)

  const a = first.bits
  const b = second.bits
  const o = out.bits

  const aLen = a.length
  const bLen = b.length
  const shared = Math.min(aLen, bLen)

  o.fill(0n)

  for (let i = 0; i < shared; i++) o[i] = a[i]! & ~b[i]!
  if (aLen > shared) for (let i = shared; i < aLen; i++) o[i] = a[i]!

  return out
}

export const and = (first: Bitmap, second: Bitmap): Bitmap => andInto(create(Math.max(first.capacity, second.capacity)), first, second)
export const or  = (first: Bitmap, second: Bitmap): Bitmap  => orInto(create(Math.max(first.capacity, second.capacity)),  first, second)
export const not = (first: Bitmap, second: Bitmap): Bitmap => notInto(create(Math.max(first.capacity, second.capacity)), first, second)

function reserve(target: Bitmap, capacity: number): void {
  if (target.capacity >= capacity) {
    if (target.bits.length >= Math.ceil(capacity / MAP_BITS)) return
  }

  scale(target, capacity)
}

function nextPowerOf2(x: number): number {
  if (x <= 1) return 1

  x = x - 1
  x |= x >> 1
  x |= x >> 2
  x |= x >> 4
  x |= x >> 8
  x |= x >> 16
  
  return (x + 1) >>> 0
}

function popcount32(value: number): number {
  let x = value >>> 0

  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)

  return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24
}

function countTrailingZeros64(value: bigint): number {
  if (value === 0n) return 64

  const low32 = Number(value & 0xFFFFFFFFn) >>> 0

  if (low32 !== 0) return countTrailingZeros32(low32)
  
  return 32 + countTrailingZeros32(Number((value >> 32n) & 0xFFFFFFFFn) >>> 0)
}

function countTrailingZeros32(value: number): number {
  return 31 - Math.clz32((value & -value) >>> 0)
}