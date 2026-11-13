import { describe, expect, it } from 'vitest'
import { ApiError } from '../../src/http/client/ApiError'
import { describeApiFailure } from '../../src/http/describeApiFailure'

function quotaFailure(details: unknown): ApiError {
  return new ApiError(422, 'rule limit of 2 reached', details)
}

describe('describeApiFailure', () => {
  it('explains the rule limit in Portuguese', () => {
    const failure = quotaFailure({ code: 'rule-quota-exceeded', maxRulesPerUser: 2 })
    expect(describeApiFailure(failure)).toBe('Você atingiu o limite de 2 regras.')
  })

  it('still explains the rule limit when the number is missing', () => {
    expect(describeApiFailure(quotaFailure({ code: 'rule-quota-exceeded' }))).toBe(
      'Você atingiu o limite de regras.',
    )
  })

  it('keeps the server message for other API errors', () => {
    const failure = new ApiError(409, 'rule already exists', { error: 'rule already exists' })
    expect(describeApiFailure(failure)).toBe('rule already exists')
  })

  it('keeps the message of plain errors', () => {
    expect(describeApiFailure(new Error('offline'))).toBe('offline')
  })

  it('falls back to a generic message for unknown failures', () => {
    expect(describeApiFailure('boom')).toBe('Erro inesperado')
  })
})
