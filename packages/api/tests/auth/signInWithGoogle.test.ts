import { describe, expect, it, vi } from 'vitest'
import { signInWithGoogle } from '../../src/auth/google/signInWithGoogle'

const redirectUri = 'https://app.test/callback'

function buildAuthenticator() {
  const beginGoogleSignIn = vi.fn().mockResolvedValue({
    url: 'https://auth.test/authorize',
    verifier: 'verifier-1',
    state: 'state-1',
  })
  const exchangeOAuthCode = vi.fn().mockResolvedValue(undefined)
  return { beginGoogleSignIn, exchangeOAuthCode }
}

describe('signInWithGoogle', () => {
  it('exchanges the returned code with the verifier of the same sign in', async () => {
    const authenticator = buildAuthenticator()
    const openConsentWindow = vi.fn().mockResolvedValue(`${redirectUri}?code=code-1&state=state-1`)

    await signInWithGoogle(authenticator, redirectUri, openConsentWindow)

    expect(authenticator.beginGoogleSignIn).toHaveBeenCalledWith(redirectUri)
    expect(openConsentWindow).toHaveBeenCalledWith('https://auth.test/authorize')
    expect(authenticator.exchangeOAuthCode).toHaveBeenCalledWith({
      code: 'code-1',
      verifier: 'verifier-1',
      redirectUri,
    })
  })

  it('does nothing when the consent window closes without a callback', async () => {
    const authenticator = buildAuthenticator()

    await signInWithGoogle(authenticator, redirectUri, async () => null)

    expect(authenticator.exchangeOAuthCode).not.toHaveBeenCalled()
  })

  it('refuses a callback whose state belongs to another sign in', async () => {
    const authenticator = buildAuthenticator()
    const forgedCallback = async () => `${redirectUri}?code=code-1&state=forged`

    await expect(signInWithGoogle(authenticator, redirectUri, forgedCallback)).rejects.toThrow(
      'OAuth state',
    )
    expect(authenticator.exchangeOAuthCode).not.toHaveBeenCalled()
  })
})
