import { describe, expect, it } from 'vitest'
import { challengeForSignInFailure } from '../../src/auth/cognito/challengeForSignInFailure'

describe('challengeForSignInFailure', () => {
  it('turns a required password reset into a challenge', () => {
    const failure = { code: 'PasswordResetRequiredException', message: 'reset' }

    expect(challengeForSignInFailure(failure)).toEqual({ kind: 'RESET_REQUIRED' })
  })

  it('turns an unconfirmed user into a challenge', () => {
    const failure = Object.assign(new Error('not confirmed'), { name: 'UserNotConfirmedException' })

    expect(challengeForSignInFailure(failure)).toEqual({ kind: 'CONFIRMATION_REQUIRED' })
  })

  it('leaves wrong credentials as a failure', () => {
    const failure = { code: 'NotAuthorizedException', message: 'Incorrect username or password.' }

    expect(challengeForSignInFailure(failure)).toBeNull()
  })

  it('leaves unknown values as a failure', () => {
    expect(challengeForSignInFailure('boom')).toBeNull()
    expect(challengeForSignInFailure(null)).toBeNull()
  })
})
