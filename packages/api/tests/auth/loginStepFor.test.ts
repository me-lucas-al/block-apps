import { describe, expect, it } from 'vitest'
import type { AuthResult } from '../../src/auth/contracts/AuthResult'
import { loginStepFor } from '../../src/auth/loginStepFor'

function challengeResult(kind: 'NEW_PASSWORD_REQUIRED' | 'MFA_REQUIRED' | 'RESET_REQUIRED' | 'CONFIRMATION_REQUIRED'): AuthResult {
  return { success: false, challenge: { kind } }
}

describe('loginStepFor', () => {
  it('maps a successful sign in to signed_in', () => {
    expect(loginStepFor({ success: true })).toBe('signed_in')
  })

  it.each([
    ['NEW_PASSWORD_REQUIRED', 'new_password'],
    ['MFA_REQUIRED', 'totp'],
    ['RESET_REQUIRED', 'reset_password'],
    ['CONFIRMATION_REQUIRED', 'confirm_signup'],
  ] as const)('maps the %s challenge to %s', (kind, expectedStep) => {
    expect(loginStepFor(challengeResult(kind))).toBe(expectedStep)
  })

  it('maps the mfa setup challenge to mfa_setup', () => {
    const result: AuthResult = {
      success: false,
      challenge: { kind: 'MFA_SETUP', secretCode: 'SECRET' },
    }

    expect(loginStepFor(result)).toBe('mfa_setup')
  })
})
