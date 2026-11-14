import { afterEach, describe, expect, it, vi } from 'vitest'
import { readConfiguredRuleLimit } from '../../src/composition/readConfiguredRuleLimit'

describe('readConfiguredRuleLimit', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the configured limit without logging', () => {
    const logError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(readConfiguredRuleLimit({ MAX_RULES_PER_USER: '7' })).toBe(7)
    expect(logError).not.toHaveBeenCalled()
  })

  it('logs a structured message before failing on an invalid limit', () => {
    const logError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => readConfiguredRuleLimit({ MAX_RULES_PER_USER: 'abc' })).toThrow(
      'MAX_RULES_PER_USER must be a positive integer',
    )
    expect(JSON.parse(String(logError.mock.calls[0]?.[0]))).toEqual({
      message: 'invalid rule limit configuration',
      detail: 'MAX_RULES_PER_USER must be a positive integer, received "abc"',
    })
  })
})
