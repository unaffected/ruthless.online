import type { Action, ActionContext } from '@/game/config/action'

type Phase = 'activate' | 'deactivate' | 'startup' | 'active' | 'recovery' | 'cooldown' | 'channel' | 'charge'

export const call = (action: Action, phase: Phase, ctx: ActionContext): void => {
  const before = `before_${phase}` as keyof Action
  const on = `on_${phase}` as keyof Action
  const after = `after_${phase}` as keyof Action
  
  const before_hook = action[before]
  const on_hook = action[on]
  const after_hook = action[after]
  
  if (typeof before_hook === 'function') before_hook(ctx)
  if (typeof on_hook === 'function') on_hook(ctx)
  if (typeof after_hook === 'function') after_hook(ctx)
}

