export type Field = {
  name: string
  type: 'f32' | 'f64' | 'u8' | 'u16' | 'u32' | 'i8' | 'i16' | 'i32'
  array: Float32Array | Float64Array | Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array
}

const BYTES_PER_TYPE: Record<Field['type'], number> = {
  f32: 4, f64: 8,
  u8: 1, u16: 2, u32: 4,
  i8: 1, i16: 2, i32: 4
}

export const create_soa_serializer = (fields: Field[]) => {
  let buffer = new ArrayBuffer(4096)
  let view = new DataView(buffer)
  
  const bytes_per_field = fields.map(f => BYTES_PER_TYPE[f.type])
  const total_bytes_per_entity = bytes_per_field.reduce((a, b) => a + b, 0)
  
  return (entities: number[]): ArrayBuffer => {
    if (entities.length === 0) return new ArrayBuffer(0)
    
    const required_size = 4 + entities.length * (4 + total_bytes_per_entity)
    if (buffer.byteLength < required_size) {
      buffer = new ArrayBuffer(required_size * 2)
      view = new DataView(buffer)
    }
    
    let offset = 0
    
    view.setUint32(offset, entities.length, true)

    offset += 4
    
    for (const entity of entities) {
      view.setUint32(offset, entity, true)
      
      offset += 4
            
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i]!
        const value = field.array[entity & 0xFFFFF] || 0
        
        switch (field.type) {
          case 'f32': view.setFloat32(offset, value, true); break
          case 'f64': view.setFloat64(offset, value, true); break
          case 'u8': view.setUint8(offset, value); break
          case 'u16': view.setUint16(offset, value, true); break
          case 'u32': view.setUint32(offset, value, true); break
          case 'i8': view.setInt8(offset, value); break
          case 'i16': view.setInt16(offset, value, true); break
          case 'i32': view.setInt32(offset, value, true); break
        }
        
        offset += bytes_per_field[i]!
      }
    }
    
    return buffer.slice(0, required_size)
  }
}

export const create_soa_deserializer = (fields: Field[]) => {
  const bytes_per_field = fields.map(f => BYTES_PER_TYPE[f.type])
  
  return (data: ArrayBuffer, entity_map: Map<number, number>): void => {
    const view = new DataView(data)
    let offset = 0
    
    const count = view.getUint32(offset, true)
    offset += 4
    
    for (let i = 0; i < count; i++) {
      const server_entity = view.getUint32(offset, true)

      offset += 4
      
      const client_entity = entity_map.get(server_entity)

      if (client_entity === undefined) {
        offset += bytes_per_field.reduce((a, b) => a + b, 0)
        continue
      }
            
      for (let j = 0; j < fields.length; j++) {
        const field = fields[j]!

        let value: number
        
        switch (field.type) {
          case 'f32': value = view.getFloat32(offset, true); break
          case 'f64': value = view.getFloat64(offset, true); break
          case 'u8': value = view.getUint8(offset); break
          case 'u16': value = view.getUint16(offset, true); break
          case 'u32': value = view.getUint32(offset, true); break
          case 'i8': value = view.getInt8(offset); break
          case 'i16': value = view.getInt16(offset, true); break
          case 'i32': value = view.getInt32(offset, true); break
          default: value = 0
        }
        
        field.array[client_entity & 0xFFFFF] = value

        offset += bytes_per_field[j]!
      }
    }
  }
}

export type ComponentGetter = (entity: number) => number[]

export const create_observer = (get_components?: ComponentGetter) => {
  const seen = new Set<number>()

  let buffer = new ArrayBuffer(1024)

  let view = new DataView(buffer)
  
  return {
    serialize: (entities: number[]): ArrayBuffer => {
      const current = new Set(entities)
      const added: number[] = []
      const removed: number[] = []
      
      for (const entity of entities) {
        if (seen.has(entity)) continue
        
        added.push(entity)
        seen.add(entity)
      }
      
      for (const entity of seen) {
        if (current.has(entity)) continue
        
        removed.push(entity)
      }
      
      for (const entity of removed) seen.delete(entity)
      
      if (added.length === 0 && removed.length === 0) return new ArrayBuffer(0)
      
      const required_size = 8 + added.length * (get_components ? 6 : 4) + removed.length * 4

      if (buffer.byteLength < required_size) {
        buffer = new ArrayBuffer(required_size * 2)
        view = new DataView(buffer)
      }
      
      let offset = 0

      view.setUint32(offset, added.length, true)

      offset += 4

      for (const entity of added) {
        view.setUint32(offset, entity, true)
        offset += 4
        
        if (get_components) {
          const components = get_components(entity)

          view.setUint16(offset, components.length, true)

          offset += 2
          
          for (const component_id of components) {
            if (offset >= buffer.byteLength) {
              const new_buffer = new ArrayBuffer(buffer.byteLength * 2)
              const new_view = new DataView(new_buffer)

              new Uint8Array(new_buffer).set(new Uint8Array(buffer))

              buffer = new_buffer
              view = new_view
            }
            
            view.setUint8(offset, component_id)
            1
            offset += 1
          }
        }
      }
      
      view.setUint32(offset, removed.length, true)

      offset += 4

      for (const entity of removed) {
        view.setUint32(offset, entity, true)
        offset += 4
      }
      
      return buffer.slice(0, offset)
    },
    
    deserialize: (data: ArrayBuffer, entity_map: Map<number, number>, on_add: (entity: number, components?: number[]) => void, on_remove: (entity: number) => void): void => {
      const view = new DataView(data)

      let offset = 0
      
      const added_count = view.getUint32(offset, true)

      offset += 4

      for (let i = 0; i < added_count; i++) {
        const server_entity = view.getUint32(offset, true)

        offset += 4
        
        let components: number[] | undefined
        
        if (get_components !== undefined) {
          const component_count = view.getUint16(offset, true)

          offset += 2
          
          components = []
          
          for (let j = 0; j < component_count; j++) {
            components.push(view.getUint8(offset))
            offset += 1
          }
        }

        on_add(server_entity, components)
      }
      
      const removed_count = view.getUint32(offset, true)

      offset += 4

      for (let i = 0; i < removed_count; i++) {
        const server_entity = view.getUint32(offset, true)
        const client_entity = entity_map.get(server_entity)

        offset += 4
        
        if (client_entity === undefined) continue
          
        on_remove(server_entity)
      }
    }
  }
}

