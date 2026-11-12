import { describe, expect, it } from 'vitest'
import { type PendingChangeRow, toPendingChange } from '../pendingChangeRow'
import { readReturnedPendingChange } from '../readReturnedPendingChange'

const row: PendingChangeRow = {
  id: 'change-1',
  rule_id: 'rule-1',
  kind: 'update',
  mode: 'schedule',
  windows: [{ days: [1], start: '18:00', end: '20:00' }],
  effective_at: '2026-01-06T12:00:00.000Z',
}

describe('pendingChangeRow mapping', () => {
  it('maps a database row into a PendingRuleChange', () => {
    expect(toPendingChange(row)).toEqual({
      id: 'change-1',
      ruleId: 'rule-1',
      kind: 'update',
      mode: 'schedule',
      windows: [{ days: [1], start: '18:00', end: '20:00' }],
      effectiveAt: '2026-01-06T12:00:00.000Z',
    })
  })

  it('keeps null mode and windows for removals', () => {
    const removal = toPendingChange({ ...row, kind: 'delete', mode: null, windows: null })
    expect(removal.mode).toBeNull()
    expect(removal.windows).toBeNull()
  })

  it('reads the change whether PostgREST returns an object or an array', () => {
    expect(readReturnedPendingChange(row)).toEqual(toPendingChange(row))
    expect(readReturnedPendingChange([row])).toEqual(toPendingChange(row))
  })

  it('fails with a clear error when no row comes back', () => {
    expect(() => readReturnedPendingChange([])).toThrow('Supabase returned no pending change')
  })
})
