import { describe, expect, it, vi } from 'vitest'
import {
  CognitoAuthenticator,
  type CognitoAuthenticatorParts,
} from '../../src/auth/cognito/CognitoAuthenticator'
import type { SessionTokens } from '../../src/auth/contracts/SessionTokens'

const tokens: SessionTokens = {
  accessToken: 'acc',
  idToken: 'id',
  refreshToken: 'ref',
  email: 'a@b.com',
}

function buildAuthenticator(parts: Partial<Record<keyof CognitoAuthenticatorParts, object>>) {
  return new CognitoAuthenticator(parts as unknown as CognitoAuthenticatorParts)
}

describe('CognitoAuthenticator with injected parts', () => {
  it('asks the account operations to resend the confirmation code', async () => {
    const resendConfirmationCode = vi.fn().mockResolvedValue(undefined)
    const authenticator = buildAuthenticator({ accountOps: { resendConfirmationCode } })

    await authenticator.resendConfirmationCode('a@b.com')

    expect(resendConfirmationCode).toHaveBeenCalledWith('a@b.com')
  })

  it('persists the tokens returned by the oauth code exchange', async () => {
    const exchangeCode = vi.fn().mockResolvedValue(tokens)
    const persistTokens = vi.fn().mockResolvedValue(undefined)
    const authenticator = buildAuthenticator({
      oauthFlow: { exchangeCode },
      sessionManager: { persistTokens },
    })

    await authenticator.exchangeOAuthCode('code-1', 'verifier-1', 'https://app.test/cb')

    expect(exchangeCode).toHaveBeenCalledWith('code-1', 'https://app.test/cb', 'verifier-1')
    expect(persistTokens).toHaveBeenCalledWith(tokens)
  })

  it('fails the totp enrollment when the session cannot be refreshed', async () => {
    const authenticator = buildAuthenticator({
      totpEnrollment: {},
      sessionManager: { refreshSession: vi.fn().mockResolvedValue(null) },
    })

    await expect(authenticator.beginTotpEnrollment()).rejects.toThrow('Sessão expirada')
  })
})
