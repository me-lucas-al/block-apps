import { describe, expect, it } from 'vitest'
import type { SignInResult } from '@block-apps/api'
import { describeNextLoginStep, MFA_SETUP_UNSUPPORTED_NOTICE } from '../describeNextLoginStep'

describe('describeNextLoginStep', () => {
  it('stays on the login view without a notice after a successful sign in', () => {
    expect(describeNextLoginStep({ kind: 'signed_in' })).toEqual({ view: 'login', notice: null })
  })

  it('opens the totp view when a code is required', () => {
    expect(describeNextLoginStep({ kind: 'mfa_totp_required' })).toEqual({ view: 'totp' })
  })

  it('opens the new password view', () => {
    expect(describeNextLoginStep({ kind: 'new_password_required' })).toEqual({ view: 'new_password' })
  })

  it('opens the sign up confirmation for an unconfirmed account', () => {
    expect(describeNextLoginStep({ kind: 'unconfirmed_user' })).toEqual({ view: 'confirm_signup' })
  })

  it('opens the forgot password view when a reset is required', () => {
    expect(describeNextLoginStep({ kind: 'password_reset_required' })).toEqual({ view: 'forgot_password' })
  })

  it('explains that the popup cannot set up MFA', () => {
    expect(describeNextLoginStep({ kind: 'mfa_setup_required', secretCode: 'SECRET' })).toEqual({
      view: 'login',
      notice: MFA_SETUP_UNSUPPORTED_NOTICE,
    })
  })

  it('throws on a result kind it does not know', () => {
    const unknownResult = { kind: 'something_new' } as unknown as SignInResult

    expect(() => describeNextLoginStep(unknownResult)).toThrow('Unhandled sign-in result')
  })
})
