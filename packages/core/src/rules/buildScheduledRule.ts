import { validateSchedule, type ScheduleError } from '../schedule/editing/validateSchedule'
import type { BlockMode, BlockRule, TargetType, TimeWindow } from './blockRule'

export type NewScheduledRule = Omit<BlockRule, 'id'>

export type BuildScheduledRuleResult =
  | { rule: NewScheduledRule; error: null }
  | { rule: null; error: Exclude<ScheduleError, null> }

export function buildScheduledRule(
  targetType: TargetType,
  target: string,
  mode: BlockMode,
  windows: readonly TimeWindow[],
): BuildScheduledRuleResult {
  const scheduleError = validateSchedule(mode, windows)
  if (scheduleError) return { rule: null, error: scheduleError }

  const rule: NewScheduledRule = {
    targetType,
    target,
    mode,
    windows: mode === 'schedule' ? windows : [],
  }
  return { rule, error: null }
}
