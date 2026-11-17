import { describe, expect, it } from 'vitest'
import { buildRuleId } from '../buildRuleId'

describe('buildRuleId', () => {
  it.each([
    ['site', 'example.com', 'site~example.com'],
    ['iosSelection', 'redes-sociais', 'iosSelection~redes-sociais'],
    ['protection', 'ios-deny-app-removal', 'protection~ios-deny-app-removal'],
  ] as const)('joins %s and %s', (targetType, target, expectedId) => {
    expect(buildRuleId(targetType, target)).toBe(expectedId)
  })
})
