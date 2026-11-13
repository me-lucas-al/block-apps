import type { BlockRule } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import { toNativeRulesJson } from '../toNativeRulesJson'

const appRule: BlockRule = {
  id: 'rule-1',
  targetType: 'app',
  target: 'com.instagram.android',
  mode: 'schedule',
  windows: [{ days: [1, 2], start: '18:00', end: '20:00' }],
}

const siteRule: BlockRule = {
  id: 'rule-2',
  targetType: 'site',
  target: 'example.com',
  mode: 'always',
  windows: [],
}

describe('toNativeRulesJson', () => {
  it('keeps only app rules and drops ids', () => {
    expect(JSON.parse(toNativeRulesJson([appRule, siteRule]))).toEqual([
      {
        target: 'com.instagram.android',
        mode: 'schedule',
        windows: [{ days: [1, 2], start: '18:00', end: '20:00' }],
      },
    ])
  })

  it('serializes no rules as an empty array', () => {
    expect(toNativeRulesJson([siteRule])).toBe('[]')
  })
})
