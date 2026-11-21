import { buildRuleId, TARGET_TYPES } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import { SITE_RULE_SORT_PREFIX } from '../../src/storage/dynamodb/keys/siteRuleSortPrefix'
import { ruleSortKey } from '../../src/storage/dynamodb/keys/sortKeys'

describe('SITE_RULE_SORT_PREFIX', () => {
  it('is the stored sort key prefix of every site rule and of no other target type', () => {
    expect(ruleSortKey(buildRuleId('site', 'exemplo.com')).startsWith(SITE_RULE_SORT_PREFIX)).toBe(true)
    for (const otherTargetType of TARGET_TYPES.filter((targetType) => targetType !== 'site')) {
      const otherSortKey = ruleSortKey(buildRuleId(otherTargetType, 'exemplo.com'))
      expect(otherSortKey.startsWith(SITE_RULE_SORT_PREFIX)).toBe(false)
    }
  })

  it('keeps the persisted layout the resolver query depends on', () => {
    expect(SITE_RULE_SORT_PREFIX).toBe('RULE#site~')
  })
})
