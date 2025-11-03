declare module '@/game' { interface Components { projectile: typeof component }}

export const id = 'projectile' as const

export const component = {
  owner: new Uint32Array([]),
  damage: new Float32Array([]),
  lifetime: new Float32Array([]),
  spawned_at: new Float32Array([])
}

