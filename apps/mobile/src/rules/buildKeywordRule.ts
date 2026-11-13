import {
  type BlockMode,
  type ScheduleError,
  type TimeWindow,
  normalizeKeywordTarget,
} from '@block-apps/core'
import { buildRuleWithSchedule, type ScheduledRuleResult } from './buildRuleWithSchedule'

export type KeywordRuleDraft = {
  keyword: string
  mode: BlockMode
  windows: readonly TimeWindow[]
}

export type KeywordRuleError = 'invalid-keyword' | Exclude<ScheduleError, null>

export type BuildKeywordRuleResult = ScheduledRuleResult | { rule: null; error: KeywordRuleError }

export function buildKeywordRule(draft: KeywordRuleDraft): BuildKeywordRuleResult {
  const keyword = normalizeKeywordTarget(draft.keyword)
  if (!keyword) return { rule: null, error: 'invalid-keyword' }

  return buildRuleWithSchedule('keyword', keyword, draft.mode, draft.windows)
}
