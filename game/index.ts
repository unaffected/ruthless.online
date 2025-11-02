import * as components from '@/game/component'
import systems from '@/game/system'
import * as bitmap from '@/game/utility/bitmap'
import * as binary from '@/game/utility/binary'

export type Attribute = Float32Array | Float64Array | Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array
export type Attributes<C extends COMPONENT> = Record<keyof Components[C], Attribute>
export type Component<C extends COMPONENT> = Record<keyof Components[C], number>
export type COMPONENT = keyof Components

export type Store<C extends COMPONENT> = {
  id: C
  entities: bitmap.Bitmap
  updated: bitmap.Bitmap
  attributes: Components[C]
  capacity: number
}

export interface Components {}

export type Filter = {
  all?: Array<COMPONENT>
  any?: Array<COMPONENT>
  none?: Array<COMPONENT>
}

export type Entities = {
  capacity: number
  count: number
  pool: number[]
  next: number
  spawned: Uint32Array
}

export type System<O = any> = {
  id: string
  install?: (this: Game, game: Game, options: O) => Promise<void>
  tick?: (this: Game, game: Game, delta: number, options: O) => Promise<void>
  dependencies?: Array<System>
  options?: O
}

export type Systems = Array<Systems | System<any>>

export type Options = {
  entity_version_bits?: number
  camera_speed?: number
  camera_snap_threshold?: number
  capacity?: number
  framerate?: number
  input_throttle_rate?: number
  input_keepalive_rate?: number
  input_rate_limit?: number
  interpolation_enabled?: boolean
  interpolation_speed?: number
  interpolation_snap_threshold?: number
  interpolation_rollback_threshold?: number
  grid_cell_size?: number
  grid_load_radius?: number
  network_sync_threshold?: number
  network_position_sync_threshold?: number
  network_velocity_sync_threshold?: number
  network_rotation_sync_threshold?: number
  network_health_sync_threshold?: number
  network_movement_sync_threshold?: number
  prediction_enabled?: boolean
  prediction_error_threshold?: number
  prediction_buffer_size?: number
}

export const ENTITY_INDEX_BITS = 20
export const ENTITY_VERSION_BITS = 12
export const ENTITY_MAX_INDEX = (1 << ENTITY_INDEX_BITS) - 1
export const ENTITY_MAX_VERSION = (1 << ENTITY_VERSION_BITS) - 1

export class Game {
  public readonly id: string

  public active: boolean = false
  public clock: number = 0
  public frame: number = 0
  public timeout: NodeJS.Timeout | number | null = null

  public components: Components = components
  public entities: Entities
  public registry: Map<Component<COMPONENT>, COMPONENT> = new Map()
  public scaling: Set<COMPONENT> = new Set()
  public state: Record<string, Store<any>> = {}

  public installed: string[] = []
  public systems: System[] = []
  public options: Options

  static async make(systems: System|Systems = [], options: Options = {}) {
    const game = new Game(options)

    await game.install(systems)

    return game
  }

  constructor(options: Options = {}) {
    this.id = crypto.randomUUID()
    this.options = options
    this.options.framerate ??= 60
    this.options.capacity ??= 1024

    const capacity = this.options.capacity

    this.entities = {
      capacity,
      count: 0,
      pool: [],
      next: 0,
      spawned: new Uint32Array(capacity)
    }

    for (const [name, component] of Object.entries(this.components)) {
      this.register(name as COMPONENT, component as Attributes<COMPONENT>)
    }
  }

  public add<C extends keyof Components>(entity: number, name: C, attributes?: Component<C>): Game {
    let instance = this.state[name as string]

    if (!instance || !this.exists(entity)) return this
    
    const unpacked = this.unpack(entity)
    
    if (unpacked.index >= instance.capacity) {
      this.scale(name as COMPONENT)
      instance = this.state[name as string]!
    }
    
    bitmap.set(instance.entities, unpacked.index)
    bitmap.set(instance.updated, unpacked.index)
    
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        const array = instance.attributes[key]
        
        if (binary.isArray(array)) {
          array[unpacked.index] = value as number
        }
      }
    }
    
    return this
  }

  public despawn(entity: number): Game {
    this.add(entity, 'despawned')
    return this
  }

  public exists(entity: number): boolean {
    const unpacked = this.unpack(entity)
    
    return unpacked.index >= 0
      && unpacked.index < this.entities.capacity
      && (this.entities.spawned[unpacked.index]! & ENTITY_MAX_VERSION) === unpacked.offset
  }

  public filter(filter: Filter): number[] {
    let result: bitmap.Bitmap | null = null

    filter.all ??= []
    filter.any ??= []
    filter.none ??= []
    
    for (const id of filter.all) {
      const component = this.state[id as string]

      if (!component) return []
      
      result = result ? bitmap.and(result, component.entities) : bitmap.clone(component.entities)
    }
    
    if (filter.any.length > 0) {
      let any_bitmap: bitmap.Bitmap | null = null
      
      for (const id of filter.any) {
        const component = this.state[id as string]

        if (!component) continue
        
        any_bitmap = any_bitmap ? bitmap.or(any_bitmap, component.entities) : bitmap.clone(component.entities)
      }
      
      if (!any_bitmap) return []
      
      result = result ? bitmap.and(result, any_bitmap) : any_bitmap
    }
    
    for (const id of filter.none) {
      const component = this.state[id as string]

      if (!component) continue
      
      result = result ? bitmap.not(result, component.entities) : null
    }
    
    if (!result) return []
    
    return bitmap.collect(result).map(idx => this.pack(idx, this.entities.spawned[idx]! & ENTITY_MAX_VERSION))
  }

  public flush(component?: COMPONENT): Game {
    if (typeof component !== 'undefined') {
      const instance = this.state[component]

      if (instance) bitmap.flush(instance.updated)

      return this
    }

    for (const entity of this.query([this.components.despawned])) {
      this.purge(entity)
      this.emit('game:despawned', entity)
    }

    for (const instance of Object.values(this.state)) {
      bitmap.flush(instance.updated)
    }

    return this
  }

  public get<C extends keyof Components>(entity: number, name: C): Component<C> | undefined {
    if (!this.has(entity, name)) return undefined
    
    const idx = this.unpack(entity).index
    const attributes = this.components[name]
    const result = {} as Component<C>
    
    for (const key in attributes) {
      const array = (attributes as any)[key]

      if (array && typeof array === 'object' && 'length' in array) {
        result[key as keyof Component<C>] = array[idx]
      }
    }
    
    return result
  }

  public has<C extends keyof Components>(entity: number, name: C): boolean {
    const instance = this.state[name as string]

    if (!instance) return false
    
    const unpacked = this.unpack(entity)

    if (!this.exists(entity)) return false
    
    return bitmap.has(instance.entities, unpacked.index)
  }

  public async install(system: System | Systems): Promise<Game> {
    if (Array.isArray(system)) {
      await Promise.all(system.map(this.install.bind(this)))

      return this
    }

    await this.install(system.dependencies ?? [])

    if (!this.installed.includes(system.id)) {
      this.installed.push(system.id)
      
      if (system.install) {
        await system.install.call(this, this, system.options ?? {})
      }

      this.systems.push(system)

      console.debug(`[${system.id}] system initialized`)
    }

    return this
  }

  public option<K extends keyof Options>(key: K, fallback: NonNullable<Options[K]>): NonNullable<Options[K]>
  public option<K extends keyof Options>(key: K, fallback?: Options[K]): Options[K] | null {
    return this.options[key] ?? fallback ?? null
  }

  public pack(index: number, offset: number): number {
    return (((offset & ENTITY_MAX_VERSION) << ENTITY_INDEX_BITS) | (index & ENTITY_MAX_INDEX)) >>> 0
  }

  public query(query: Filter|Array<Components[COMPONENT]>): number[] {
    if (Array.isArray(query)) {
      return this.filter({
        all: query.map(c => this.registry.get(c)).filter(Boolean) as COMPONENT[],
        none: query.includes(this.components.despawned) ? [] : ['despawned']
      })
    }

    return this.filter(query)
  }

  public read<C extends keyof Components, K extends keyof Components[C]>(entity: number, component: C, attribute: K): number {
    const idx = this.unpack(entity).index
    const array = (this.components[component] as any)[attribute]
    
    return array ? array[idx] : 0
  }

  public register<C extends COMPONENT>(name: C, component: Attributes<C>): Game {
    for (const [key, value] of Object.entries(component) as [keyof Attributes<C>, Attribute][]) {
      if (!binary.isArray(value)) continue

      const grown = binary.grow(value, this.entities.capacity)
      
      component[key] = grown;

      (this.components[name] as any)[key] = grown
    }

    this.state[name] = {
      id: name,
      entities: bitmap.create(this.entities.capacity),
      updated: bitmap.create(this.entities.capacity),
      attributes: this.components[name],
      capacity: this.entities.capacity
    } as Store<C>

    this.registry.set(this.components[name], name)
    return this
  }

  public remove<C extends COMPONENT>(entity: number, name: C): Game {
    const instance = this.state[name]

    if (!instance) return this
    
    const unpacked = this.unpack(entity)

    if (!this.exists(entity)) return this
    
    bitmap.clear(instance.entities, unpacked.index)
    bitmap.clear(instance.updated, unpacked.index)
    
    return this
  }

  public reserve(capacity?: number): Game {
    if (typeof capacity === 'number') capacity++

    if (typeof capacity !== 'undefined' && capacity < this.entities.capacity) {
      return this
    }

    if (typeof capacity === 'undefined' && this.entities.count < this.entities.capacity) {
      return this
    }

    let target = typeof capacity === 'number' ? capacity : this.entities.capacity << 1
    let breakpoint = this.entities.capacity

    while (breakpoint < target) breakpoint = breakpoint << 1

    if (breakpoint === this.entities.capacity) return this

    const entities = new Uint32Array(breakpoint)

    entities.set(this.entities.spawned)

    this.entities.spawned = entities
    this.entities.capacity = breakpoint

    this.scale()

    return this
  }

  public scale(component?: COMPONENT): void {
    if (typeof component === 'undefined') {
      for (const name of Object.keys(this.state)) {
        this.scale(name as COMPONENT)
      }

      return
    }

    const instance = this.state[component]

    if (!instance) return

    if (instance.capacity >= this.entities.capacity) return
    if (this.scaling.has(component)) return

    this.scaling.add(component)

    try {
      const target = this.entities.capacity

      {
        const old = instance.entities
        const grown = bitmap.create(target)
        grown.bits.set(old.bits)
        instance.entities = grown
      } {
        const old = instance.updated
        const grown = bitmap.create(target)
        grown.bits.set(old.bits)
        instance.updated = grown
      }

      for (const key of Object.keys(instance.attributes)) {
        const attribute = instance.attributes[key]

        if (!binary.isArray(attribute)) continue

        const grown = binary.grow(attribute, target)

        instance.attributes[key] = grown
        
        const state = this.components[component]

        if (!state) continue

        (state as any)[key] = grown
      }

      instance.capacity = target
    } finally {
      this.scaling.delete(component)
    }
  }

  public set<C extends COMPONENT>(entity: number, name: C, attributes: Partial<Component<C>>): Game {
    if (!this.has(entity, name)) {
      this.add(entity, name, attributes as Component<C>)

      return this
    }
    
    const instance = this.state[name]

    if (!instance) return this
    
    const unpacked = this.unpack(entity)

    if (!this.exists(entity)) return this

    if (!bitmap.has(instance.entities, unpacked.index)) return this
    
    for (const [key, value] of Object.entries(attributes)) {
      const array = instance.attributes[key]

      if (!binary.isArray(array)) continue
      
      array[unpacked.index] = value as number
    }
    
    bitmap.set(instance.updated, unpacked.index)
    
    return this
  }

  public spawn(): number {
    let index: number

    if (this.entities.pool.length > 0) {
      index = this.entities.pool.pop()!
    } else {
      index = this.entities.next
      this.reserve(index)
      this.entities.next++
    }
    
    const offset = this.entities.spawned[index]! & ENTITY_MAX_VERSION

    this.entities.count++

    return this.pack(index, offset) >>> 0
  }

  public start(): void {
    if (this.timeout !== null) return

    this.timeout = setInterval(this.step.bind(this), 1000 / this.option('framerate', 30))
  }

  public step(): void {
    if (this.active) return

    const delta = performance.now() - this.clock

    this.active = true

    Promise
      .resolve(this.tick(delta))
      .finally(() => {
        this.active = false
      })
  }

  public stop(): void {
    if (this.timeout === null) return

    clearInterval(this.timeout)

    this.timeout = null
  }

  public tick(delta: number): void {
    this.clock += delta
    this.frame++

    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i]!.tick?.call(this, this, delta, this.systems[i]!.options)
    }
  }

  public unpack(entity: number): { index: number, offset: number } {
    return {
      index: (entity & ENTITY_MAX_INDEX) >>> 0,
      offset: (entity >>> ENTITY_INDEX_BITS) >>> 0,
    }
  }

  public write<C extends keyof Components, K extends keyof Components[C]>(entity: number, component: C, attribute: K, value: number): Game {
    const idx = this.unpack(entity).index
    const array = (this.components[component] as any)[attribute]

    if (array) array[idx] = value
    
    return this
  }

  // private api

  private purge(entity: number): this {
    const unpacked = this.unpack(entity)

    if (unpacked.index < 0 || unpacked.index >= this.entities.capacity) {
      return this
    }

    if ((this.entities.spawned[unpacked.index]! & ENTITY_MAX_VERSION) !== unpacked.offset) {
      return this
    }

    this.entities.count--
    this.entities.spawned[unpacked.index] = (unpacked.offset + 1) & ENTITY_MAX_VERSION

    for (const instance of Object.values(this.state)) {
      if (unpacked.index < instance.capacity) {
        bitmap.clear(instance.entities, unpacked.index)
        bitmap.clear(instance.updated, unpacked.index)
      }
    }

    this.entities.pool.push(unpacked.index)

    return this
  }
}

export const game = await Game.make(systems)

export default game
