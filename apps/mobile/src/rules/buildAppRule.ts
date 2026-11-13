import {
  type BlockMode,
  type ScheduleError,
  type TimeWindow,
  parseAppIdentifier,
} from '@block-apps/core'
import { buildRuleWithSchedule, type ScheduledRuleResult } from './buildRuleWithSchedule'

export type AppRuleDraft = {
  packageName: string | null
  mode: BlockMode
  windows: readonly TimeWindow[]
}

export type AppRuleError = 'no-app' | 'invalid-app' | Exclude<ScheduleError, null>

export type BuildAppRuleResult = ScheduledRuleResult | { rule: null; error: AppRuleError }

export function buildAppRule(draft: AppRuleDraft): BuildAppRuleResult {
  if (!draft.packageName) return { rule: null, error: 'no-app' }

  const packageName = parseAppIdentifier(draft.packageName)
  if (!packageName) return { rule: null, error: 'invalid-app' }

  return buildRuleWithSchedule('app', packageName, draft.mode, draft.windows)
}
