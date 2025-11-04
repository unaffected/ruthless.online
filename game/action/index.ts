import type { Action } from '@/game/system/action_types'
import move from './move'
import shoot from './shoot'
import sprint from './sprint'
import dash from './dash'
import regeneration from './regeneration'

export const actions = [
  move,
  shoot,
  sprint,
  dash,
  regeneration,
]

export default actions
