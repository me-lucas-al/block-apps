import type { NewBlockRule } from '@block-apps/api'
import {
  type BlockMode,
  type ScheduleError,
  type TimeWindow,
  buildRuleId,
  normalizeIosSelectionTarget,
  validateSchedule,
} from '@block-apps/core'

export type IosGroupRuleDraft = {
  groupName: string
  mode: BlockMode
  windows: readonly TimeWindow[]
}

export type IosGroupRuleError = 'no-name' | 'invalid-name' | Exclude<ScheduleError, null>

export type BuildIosGroupRuleResult =
  | { rule: NewBlockRule; ruleId: string; error: null }
  | { rule: null; ruleId: null; error: IosGroupRuleError }

export function buildIosGroupRule(draft: IosGroupRuleDraft): BuildIosGroupRuleResult {
  if (!draft.groupName.trim()) return { rule: null, ruleId: null, error: 'no-name' }

  const groupSlug = normalizeIosSelectionTarget(draft.groupName)
  if (!groupSlug) return { rule: null, ruleId: null, error: 'invalid-name' }

  const scheduleError = validateSchedule(draft.mode, draft.windows)
  if (scheduleError) return { rule: null, ruleId: null, error: scheduleError }

  const windows = draft.mode === 'schedule' ? draft.windows : []
  const rule = {
    targetType: 'iosSelection',
    target: groupSlug,
    mode: draft.mode,
    windows,
  } satisfies NewBlockRule
  return { rule, ruleId: buildRuleId('iosSelection', groupSlug), error: null }
}
