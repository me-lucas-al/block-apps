import { describe, expect, it } from 'vitest'
import { type BlockRuleRow, toBlockRule, toInsertRow } from '../blockRuleRow'

const row: BlockRuleRow = {
  id: 'rule-1',
  target_type: 'site',
  target: 'example.com',
  mode: 'schedule',
  windows: [{ days: [1], start: '18:00', end: '20:00' }],
}

describe('blockRuleRow mapping', () => {
  it('maps a database row into a BlockRule', () => {
    expect(toBlockRule(row)).toEqual({
      id: 'rule-1',
      targetType: 'site',
      target: 'example.com',
      mode: 'schedule',
      windows: [{ days: [1], start: '18:00', end: '20:00' }],
    })
  })

  it('maps a rule into an insert row without id', () => {
    const { id, ...insertRow } = row
    expect(toInsertRow(toBlockRule(row))).toEqual(insertRow)
    expect(id).toBe('rule-1')
  })
})
