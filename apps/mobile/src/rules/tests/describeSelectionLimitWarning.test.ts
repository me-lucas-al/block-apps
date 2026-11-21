import { describe, expect, it } from 'vitest'
import {
  IOS_PROTECTED_ITEMS_LIMIT,
  describeSelectionLimitWarning,
} from '../describeSelectionLimitWarning'

describe('describeSelectionLimitWarning', () => {
  it('warns about a single group with more than the limit', () => {
    expect(describeSelectionLimitWarning('singleGroup')).toBe(
      'Este grupo tem mais de 50 apps. O iOS pode não bloquear todos; divida em grupos menores.',
    )
  })

  it('warns about the sum of all groups with more than the limit', () => {
    expect(describeSelectionLimitWarning('allGroups')).toBe(
      'Os grupos somam mais de 50 apps, categorias e sites. O iOS pode não bloquear todos.',
    )
  })

  it('keeps the limit at 50 items', () => {
    expect(IOS_PROTECTED_ITEMS_LIMIT).toBe(50)
  })

  it('gives each scope its own text', () => {
    expect(describeSelectionLimitWarning('singleGroup')).not.toBe(
      describeSelectionLimitWarning('allGroups'),
    )
  })
})
