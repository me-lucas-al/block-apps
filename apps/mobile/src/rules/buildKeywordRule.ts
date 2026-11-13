import {
  type BlockMode,
  type BuildScheduledRuleResult,
  type ScheduleError,
  type TimeWindow,
  buildScheduledRule,
  normalizeKeywordTarget,
} from '@block-apps/core'

export type KeywordRuleDraft = {
  keyword: string
  mode: BlockMode
  windows: readonly TimeWindow[]
}

export type KeywordRuleError = 'invalid-keyword' | Exclude<ScheduleError, null>

export type BuildKeywordRuleResult =
  | BuildScheduledRuleResult
  | { rule: null; error: KeywordRuleError }

export function buildKeywordRule(draft: KeywordRuleDraft): BuildKeywordRuleResult {
  const keyword = normalizeKeywordTarget(draft.keyword)
  if (!keyword) return { rule: null, error: 'invalid-keyword' }

  return buildScheduledRule('keyword', keyword, draft.mode, draft.windows)
}
