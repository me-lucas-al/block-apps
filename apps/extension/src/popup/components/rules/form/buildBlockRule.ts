import {
  type BlockMode,
  type BuildScheduledRuleResult,
  type ScheduleError,
  type TimeWindow,
  buildScheduledRule,
  normalizeKeywordTarget,
  normalizeSiteTarget,
} from '@block-apps/core'
import type { RuleKind } from '../ruleKinds'

export type BlockRuleDraft = {
  kind: RuleKind
  target: string
  mode: BlockMode
  windows: readonly TimeWindow[]
}

export type BlockRuleError =
  | 'invalid-site'
  | 'invalid-keyword'
  | Exclude<ScheduleError, null>

export type BuildBlockRuleResult =
  | BuildScheduledRuleResult
  | { rule: null; error: BlockRuleError }

const TARGET_NORMALIZERS: Record<RuleKind, (input: string) => string | null> = {
  site: normalizeSiteTarget,
  keyword: normalizeKeywordTarget,
}

const INVALID_TARGET_ERRORS: Record<RuleKind, BlockRuleError> = {
  site: 'invalid-site',
  keyword: 'invalid-keyword',
}

export function buildBlockRule(draft: BlockRuleDraft): BuildBlockRuleResult {
  const target = TARGET_NORMALIZERS[draft.kind](draft.target)
  if (!target) return { rule: null, error: INVALID_TARGET_ERRORS[draft.kind] }

  return buildScheduledRule(draft.kind, target, draft.mode, draft.windows)
}
