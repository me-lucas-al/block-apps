import { describe, expect, it } from 'vitest'
import { AdminApiError } from '../../adapters/invokeAdminFunction'
import { describeFailure } from '../adminErrorMessage'

describe('describeFailure', () => {
  it.each(['unauthenticated', 'forbidden', 'not_found', 'conflict', 'self_action', 'invalid_input'])(
    'translates the %s code',
    (code) => {
      expect(describeFailure(new AdminApiError(code, 'raw'))).not.toBe('raw')
    },
  )

  it('keeps the server message for codes it does not know', () => {
    expect(describeFailure(new AdminApiError('weird', 'raw message'))).toBe('raw message')
  })

  it('falls back to the error message or a generic text', () => {
    expect(describeFailure(new Error('network down'))).toBe('network down')
    expect(describeFailure('boom')).toBe('Erro inesperado')
  })
})
