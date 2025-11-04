declare module '@/game' {
  interface Components {
    action: typeof component
  }
}

export const id = 'action' as const

export const component = {
  action_id: new Uint16Array([]),
  phase: new Uint8Array([]),
  phase_started_at: new Float64Array([]),
  charge_value: new Float32Array([]),
  last_activated: new Float64Array([]),
}

