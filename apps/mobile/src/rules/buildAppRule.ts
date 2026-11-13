import {
  type BlockMode,
  type BuildScheduledRuleResult,
  type ScheduleError,
  type TimeWindow,
  buildScheduledRule,
  parseAppIdentifier,
} from '@block-apps/core'

export type AppRuleDraft = {
  packageName: string | null
  mode: BlockMode
  windows: readonly TimeWindow[]
}

export type AppRuleError = 'no-app' | 'invalid-app' | Exclude<ScheduleError, null>

export type BuildAppRuleResult = BuildScheduledRuleResult | { rule: null; error: AppRuleError }

export function buildAppRule(draft: AppRuleDraft): BuildAppRuleResult {
  if (!draft.packageName) return { rule: null, error: 'no-app' }

  const packageName = parseAppIdentifier(draft.packageName)
  if (!packageName) return { rule: null, error: 'invalid-app' }

  return buildScheduledRule('app', packageName, draft.mode, draft.windows)
}
