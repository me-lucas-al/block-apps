import type { NewBlockRule } from '@block-apps/api'
import {
  type BlockMode,
  type ScheduleError,
  type TimeWindow,
  normalizeSiteTarget,
  validateSchedule,
} from '@block-apps/core'

export type SiteRuleDraft = {
  target: string
  mode: BlockMode
  windows: readonly TimeWindow[]
}

export type SiteRuleError = 'invalid-site' | Exclude<ScheduleError, null>

export type BuildSiteRuleResult =
  | { rule: NewBlockRule; error: null }
  | { rule: null; error: SiteRuleError }

export function buildSiteRule(draft: SiteRuleDraft): BuildSiteRuleResult {
  const target = normalizeSiteTarget(draft.target)
  if (!target) return { rule: null, error: 'invalid-site' }

  const scheduleError = validateSchedule(draft.mode, draft.windows)
  if (scheduleError) return { rule: null, error: scheduleError }

  const windows = draft.mode === 'schedule' ? draft.windows : []
  const rule = {
    targetType: 'site',
    target,
    mode: draft.mode,
    windows,
  } satisfies NewBlockRule
  return { rule, error: null }
}
