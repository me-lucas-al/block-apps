import type { PendingRuleChange } from '@block-apps/core'
import { type PendingChangeRow, toPendingChange } from './pendingChangeRow'

export function readReturnedPendingChange(
  returnedRows: PendingChangeRow | PendingChangeRow[],
): PendingRuleChange {
  const firstRow = Array.isArray(returnedRows) ? returnedRows[0] : returnedRows
  if (!firstRow) throw new Error('Supabase returned no pending change')
  return toPendingChange(firstRow)
}
