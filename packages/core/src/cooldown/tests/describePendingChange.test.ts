import { describe, expect, it } from 'vitest'
import type { PendingRuleChange } from '../../rules/pendingRuleChange'
import { describePendingChange } from '../describePendingChange'

const NOW = new Date('2026-01-05T12:00:00.000Z')
const IN_ONE_DAY = new Date(NOW.getTime() + 24 * 3_600_000).toISOString()

function change(kind: PendingRuleChange['kind']): PendingRuleChange {
  return { id: 'change', ruleId: 'rule', kind, mode: null, windows: null, effectiveAt: IN_ONE_DAY }
}

describe('describePendingChange', () => {
  it('describes a pending removal with the remaining time', () => {
    expect(describePendingChange(change('delete'), NOW)).toBe('Remoção em 24h 0min')
  })

  it('describes a pending update with the remaining time', () => {
    expect(describePendingChange(change('update'), NOW)).toBe('Alteração em 24h 0min')
  })
})
