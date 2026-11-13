import type { NewBlockRule } from '@block-apps/api'
import {
  type BlockMode,
  type ScheduleError,
  type TargetType,
  type TimeWindow,
  validateSchedule,
} from '@block-apps/core'

export type ScheduledRuleResult =
  | { rule: NewBlockRule; error: null }
  | { rule: null; error: Exclude<ScheduleError, null> }

export function buildRuleWithSchedule(
  targetType: TargetType,
  target: string,
  mode: BlockMode,
  windows: readonly TimeWindow[],
): ScheduledRuleResult {
  const scheduleError = validateSchedule(mode, windows)
  if (scheduleError) return { rule: null, error: scheduleError }

  const rule: NewBlockRule = {
    targetType,
    target,
    mode,
    windows: mode === 'schedule' ? windows : [],
  }
  return { rule, error: null }
}
