import * as ecs from 'bitecs'
import * as components from '@/game/component'
import systems from '@/game/system'

export type Attribute = Float32Array | Float64Array | Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array
export type Attributes<C extends COMPONENT> = Record<keyof Components[C], Attribute>
export type Component<C extends COMPONENT> = Record<keyof Components[C], number>
export type COMPONENT = keyof Components

export interface Components {}

export type Filter = {
  all?: Array<Components[COMPONENT]>
  any?: Array<Components[COMPONENT]>
  none?: Array<Components[COMPONENT]>
}

export type System<O = any> = {
  id: string
  install?: (this: Game, game: Game, options?: O) => Promise<void>
  tick?: (this: Game, game: Game, delta: number) => Promise<void>
  dependencies?: Array<System>
  options?: O
}

export type Systems = Array<Systems | System<any>>

export type Options = {
  camera_speed?: number
  camera_snap_threshold?: number
  framerate?: number
  input_throttle_rate?: number
  input_keepalive_rate?: number
  input_rate_limit?: number
  interpolation_enabled?: boolean
  interpolation_speed?: number
  interpolation_snap_threshold?: number
  interpolation_rollback_threshold?: number
  prediction_enabled?: boolean
  prediction_error_threshold?: number
  prediction_buffer_size?: number
}

export class Game {
  public readonly id: string

  public active: boolean = false;
  public clock: number = 0;
  public frame: number = 0;
  public timeout: NodeJS.Timeout | number | null = null;

  public components: Components = components
  public world: ecs.World

  public installed: string[] = []
  public systems: System[] = []
  public options: Options

  static async make(systems: System|Systems = [], options: Options = {}) {
    const game = new Game(options)

    await game.install(systems)

    return game
  }

  constructor(options: Options = {}) {
    this.id = Math.random().toString(36).substring(2, 15)
    this.world = ecs.createWorld()
    this.options = options
    this.options.framerate ??= 60
  }

  public add<C extends keyof Components>(entity: number, name: C, attributes?: Component<C>): Game {
    if (attributes) {
      return this.set(entity, name, attributes)
    }

    ecs.addComponent(this.world, entity, this.components[name])

    return this
  }

  public despawn(entity: number): Game {
    ecs.addComponent(this.world, entity, this.components.despawned)

    return this
  }

  public flush(): Game {
    for (const entity of this.query([this.components.despawned])) {
      ecs.removeEntity(this.world, entity)
    }

    return this
  }

  public get<C extends keyof Components>(entity: number, name: C): Component<C> | undefined {
    if (!this.has(entity, name)) {
      return undefined
    }

    const attributes: Component<C> = {} as Component<C>

    for (const entry of Object.entries(this.components[name]) as [keyof Component<C>, Attribute][]) {
      attributes[entry[0]] = entry[1][entity]!
    }

    return attributes
  }

  public has<C extends keyof Components>(entity: number, name: C): boolean {
    return ecs.hasComponent(this.world, entity, this.components[name])
  }

  public option<K extends keyof Options>(key: K, fallback: NonNullable<Options[K]>): NonNullable<Options[K]>
  public option<K extends keyof Options>(key: K, fallback?: Options[K]): Options[K] | null {
    return this.options[key] ?? fallback ?? null
  }

  public query(query: Filter|Array<Components[COMPONENT]>) {
    if (Array.isArray(query) && query.includes(this.components.despawned)) {
      return ecs.query(this.world, query)
    }

    if (Array.isArray(query)) {
      return ecs.query(this.world, [
        ecs.All(query),
        ecs.None(this.components.despawned),
      ])
    }

    query.all ??= []
    query.any ??= []
    query.none ??= []

    const shouldExcludeDespawnedEntities = !query.all.includes(this.components.despawned) 
      && !query.any.includes(this.components.despawned)
      && !query.none.includes(this.components.despawned)

    if (shouldExcludeDespawnedEntities) {
      query.none.push(this.components.despawned)
    }

    const filter = [
      query.all.length > 0 ? ecs.All(query.all) : null,
      query.any.length > 0 ? ecs.Any(query.any) : null,
      query.none.length > 0 ? ecs.None(query.none) : null
    ].filter(Boolean)

    if (filter.length === 0) {
      return []
    }

    return ecs.query(this.world, filter)
  }

  public register<C extends COMPONENT>(name: C, component: Components[C]): Game {
    ecs.registerComponent(this.world, this.components[name])

    return this
  }

  public remove<C extends COMPONENT>(entity: number, name: C): Game {    
    if (!this.components[name]) return this
    
    ecs.removeComponent(this.world, entity, this.components[name])
    
    return this
  }

  public set<C extends COMPONENT>(entity: number, name: C, attributes: Component<C>): Game {
    ecs.addComponent(this.world, entity, this.components[name])

    for (const entry of Object.entries(attributes) as [keyof Attributes<C>, number][]) {
      (this.components[name][entry[0]] as Attribute)[entity] = entry[1]
    }
        
    return this
  }

  public spawn(): number {
    return ecs.addEntity(this.world)
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

  public tick(delta: number): void {
    this.clock += delta
    this.frame++

    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i]!.tick?.call(this, this, delta)
    }
  }
}

export const game = await Game.make(systems)

export default game
