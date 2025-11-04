import type { Game } from '@/game'

export const ACTION_TYPE = {
  PASSIVE: 0,
  ACTIVATED: 1,
  CHANNELED: 2,
  CHARGED: 3,
  TOGGLED: 4,
  TRIGGERED: 5,
} as const

export type ActionType = typeof ACTION_TYPE[keyof typeof ACTION_TYPE]

export const ACTION_PHASE = {
  IDLE: 0,
  STARTUP: 1,
  ACTIVE: 2,
  RECOVERY: 3,
  COOLDOWN: 4,
} as const

export type ActionPhase = typeof ACTION_PHASE[keyof typeof ACTION_PHASE]

export const ACTION_CONDITION = {
  STANDING: 1 << 0,
  MOVING: 1 << 1,
  IN_AIR: 1 << 2,
  STUNNED: 1 << 3,
  IN_RECOVERY: 1 << 4,
} as const

export type ActionCondition = typeof ACTION_CONDITION[keyof typeof ACTION_CONDITION]

export type ActionState = {
  phase: ActionPhase
  phase_started_at: number
  charge_value: number
  last_activated: number
  params?: any
}

export type ActionContext = {
  game: Game
  entity: number
  state: ActionState
  action: Action
  delta: number
  params?: any
}

export type ACTION = keyof Actions

export type Action<K extends ACTION = ACTION> = {
  id: K
  type: ActionType
  
  conditions?: number
  
  startup_duration?: number
  active_duration?: number
  recovery_duration?: number
  cooldown_duration?: number
  
  min_channel_duration?: number
  max_channel_duration?: number
  min_charge_duration?: number
  max_charge_duration?: number
  
  energy_cost?: number | ((ctx: ActionContext) => number)
  energy_cost_per_tick?: number
  
  on_equip?: (ctx: ActionContext) => void
  on_unequip?: (ctx: ActionContext) => void
  
  before_activate?: (ctx: ActionContext) => void
  on_activate?: (ctx: ActionContext) => void
  after_activate?: (ctx: ActionContext) => void
  
  before_deactivate?: (ctx: ActionContext) => void
  on_deactivate?: (ctx: ActionContext) => void
  after_deactivate?: (ctx: ActionContext) => void
  
  on_cancel?: (ctx: ActionContext) => void
  
  before_startup?: (ctx: ActionContext) => void
  on_startup?: (ctx: ActionContext) => void
  after_startup?: (ctx: ActionContext) => void
  
  before_active?: (ctx: ActionContext) => void
  on_active?: (ctx: ActionContext) => void
  after_active?: (ctx: ActionContext) => void
  
  before_recovery?: (ctx: ActionContext) => void
  on_recovery?: (ctx: ActionContext) => void
  after_recovery?: (ctx: ActionContext) => void
  
  before_cooldown?: (ctx: ActionContext) => void
  on_cooldown?: (ctx: ActionContext) => void
  after_cooldown?: (ctx: ActionContext) => void
  
  on_tick?: (ctx: ActionContext) => void
  on_startup_tick?: (ctx: ActionContext) => void
  on_active_tick?: (ctx: ActionContext) => void
  on_recovery_tick?: (ctx: ActionContext) => void
  on_cooldown_tick?: (ctx: ActionContext) => void
  
  before_channel?: (ctx: ActionContext) => void
  on_channel?: (ctx: ActionContext) => void
  after_channel?: (ctx: ActionContext) => void
  
  on_channel_tick?: (ctx: ActionContext) => void
  
  before_charge?: (ctx: ActionContext) => void
  on_charge?: (ctx: ActionContext) => void
  after_charge?: (ctx: ActionContext) => void
  
  on_charge_tick?: (ctx: ActionContext) => void
}

export interface Actions {}

