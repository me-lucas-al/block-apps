import type { NewBlockRule } from '@block-apps/api'
import {
  type BlockMode,
  type ScheduleError,
  type TimeWindow,
  validateSchedule,
} from '@block-apps/core'

export type AppRuleDraft = {
  packageName: string | null
  mode: BlockMode
  windows: readonly TimeWindow[]
}

export type AppRuleError = 'no-app' | Exclude<ScheduleError, null>

export type BuildAppRuleResult =
  | { rule: NewBlockRule; error: null }
  | { rule: null; error: AppRuleError }

export function buildAppRule(draft: AppRuleDraft): BuildAppRuleResult {
  if (!draft.packageName) return { rule: null, error: 'no-app' }

  const scheduleError = validateSchedule(draft.mode, draft.windows)
  if (scheduleError) return { rule: null, error: scheduleError }

  const windows = draft.mode === 'schedule' ? draft.windows : []
  const rule = {
    targetType: 'app',
    target: draft.packageName,
    mode: draft.mode,
    windows,
  } satisfies NewBlockRule
  return { rule, error: null }
}
