import { type BlockMode, type TimeWindow, normalizeSiteTarget } from '@block-apps/core'
import type { NewBlockRule } from '@block-apps/api'

export type SiteRuleDraft = {
  target: string
  mode: BlockMode
  windows: readonly TimeWindow[]
}

export type BuildSiteRuleResult =
  | { rule: NewBlockRule; error: null }
  | { rule: null; error: string }

export function buildSiteRule(draft: SiteRuleDraft): BuildSiteRuleResult {
  const target = normalizeSiteTarget(draft.target)
  if (!target) return { rule: null, error: 'Informe um site válido, ex.: youtube.com' }

  if (draft.mode === 'schedule' && draft.windows.length === 0) {
    return { rule: null, error: 'Adicione ao menos um horário permitido' }
  }

  const windows = draft.mode === 'schedule' ? draft.windows : []
  return { rule: { targetType: 'site', target, mode: draft.mode, windows }, error: null }
}
