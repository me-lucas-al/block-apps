import { describe, expect, it } from 'vitest'
import { ruleErrorMessage } from '../ruleErrorMessage'

describe('ruleErrorMessage', () => {
  it('has a message for every error', () => {
    for (const error of [
      'invalid-site',
      'invalid-keyword',
      'no-windows',
      'no-days',
      'invalid-time',
    ] as const) {
      expect(ruleErrorMessage(error).length).toBeGreaterThan(0)
    }
  })
})
