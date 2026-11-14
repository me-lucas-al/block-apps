import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MAX_RULES_PER_USER,
  readMaxRulesPerUser,
} from '../../src/rules/quota/readMaxRulesPerUser'

describe('readMaxRulesPerUser', () => {
  it('uses the default when the variable is missing or empty', () => {
    expect(readMaxRulesPerUser({})).toBe(DEFAULT_MAX_RULES_PER_USER)
    expect(readMaxRulesPerUser({ MAX_RULES_PER_USER: '' })).toBe(DEFAULT_MAX_RULES_PER_USER)
  })

  it('reads a positive integer', () => {
    expect(readMaxRulesPerUser({ MAX_RULES_PER_USER: '50' })).toBe(50)
  })

  it.each(['0', '-3', '1.5', 'abc', '1e3', '0x10', ' 50 ', '1e21', '9007199254740993'])(
    'rejects %j',
    (invalidLimit) => {
      expect(() => readMaxRulesPerUser({ MAX_RULES_PER_USER: invalidLimit })).toThrow(
        `MAX_RULES_PER_USER must be a positive integer, received "${invalidLimit}"`,
      )
    },
  )
})
