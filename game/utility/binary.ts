export function isArray(x: unknown): x is (
  Float32Array | Float64Array |
  Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array
) {
  if (typeof x !== 'object' || x === null) return false

  const o = x as { buffer?: unknown; length?: unknown; BYTES_PER_ELEMENT?: unknown }

  return o.buffer instanceof ArrayBuffer
    && typeof o.length === 'number'
    && typeof o.BYTES_PER_ELEMENT === 'number'
}

export function grow<T extends
  Float32Array | Float64Array |
  Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array
>(arr: T, size: number): T {
  const Ctor = arr.constructor as { new (n: number): T }

  const out = new Ctor(size)

  out.set(arr as unknown as ArrayLike<number>, 0)
  
  return out
}