import type { NewBlockRule } from '@block-apps/api'
import {
  type BlockMode,
  type ScheduleError,
  type TimeWindow,
  normalizeKeywordTarget,
  normalizeSiteTarget,
  validateSchedule,
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
  | { rule: NewBlockRule; error: null }
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

  const scheduleError = validateSchedule(draft.mode, draft.windows)
  if (scheduleError) return { rule: null, error: scheduleError }

  const windows = draft.mode === 'schedule' ? draft.windows : []
  const rule: NewBlockRule = { targetType: draft.kind, target, mode: draft.mode, windows }
  return { rule, error: null }
}
