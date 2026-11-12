import type { BlockMode, PendingChangeKind, PendingRuleChange, TimeWindow } from '@block-apps/core'

export type PendingChangeRow = {
  id: string
  rule_id: string
  kind: PendingChangeKind
  mode: BlockMode | null
  windows: TimeWindow[] | null
  effective_at: string
}

export function toPendingChange(row: PendingChangeRow): PendingRuleChange {
  return {
    id: row.id,
    ruleId: row.rule_id,
    kind: row.kind,
    mode: row.mode,
    windows: row.windows,
    effectiveAt: row.effective_at,
  }
}

export function readPendingChange(data: PendingChangeRow | PendingChangeRow[]): PendingRuleChange {
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new Error('Supabase returned no pending change')
  return toPendingChange(row)
}
