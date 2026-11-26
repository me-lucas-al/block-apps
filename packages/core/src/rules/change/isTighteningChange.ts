import type { BlockRule } from '../blockRule'
import { buildAllowedMinutesOfWeek } from './buildAllowedMinutesOfWeek'

export type RuleSchedule = Pick<BlockRule, 'mode' | 'windows'>

export function isTighteningChange(current: RuleSchedule, requested: RuleSchedule): boolean {
  if (requested.mode === 'always') return true
  if (current.mode !== 'schedule') return false

  const currentAllowedMinutes = buildAllowedMinutesOfWeek(current.windows)
  const requestedAllowedMinutes = buildAllowedMinutesOfWeek(requested.windows)
  return requestedAllowedMinutes.every(
    (isAllowed, minute) => !isAllowed || currentAllowedMinutes[minute],
  )
}
