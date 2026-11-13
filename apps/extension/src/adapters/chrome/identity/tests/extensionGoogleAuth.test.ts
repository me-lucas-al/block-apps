import type { Authenticator } from '@block-apps/api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { launchExtensionGoogleAuth } from '../extensionGoogleAuth'

const redirectUri = 'https://mockextensionid.chromiumapp.org/'

function stubChromeIdentity(callbackUrl: string | undefined): void {
  vi.stubGlobal('chrome', {
    identity: {
      getRedirectURL: () => redirectUri,
      launchWebAuthFlow: (_details: unknown, callback: (url?: string) => void) =>
        callback(callbackUrl),
    },
    runtime: { lastError: null },
  })
}

function buildAuthenticator(exchangeOAuthCode = vi.fn().mockResolvedValue(undefined)) {
  const beginGoogleSignIn = vi.fn().mockResolvedValue({
    url: 'https://auth.test/authorize',
    verifier: 'verifier-1',
    state: 'state-1',
  })
  const authenticator = { beginGoogleSignIn, exchangeOAuthCode } as unknown as Authenticator
  return { authenticator, beginGoogleSignIn, exchangeOAuthCode }
}

describe('launchExtensionGoogleAuth', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('exchanges the received code with the verifier of the same sign in', async () => {
    stubChromeIdentity(`${redirectUri}?code=auth-code-123&state=state-1`)
    const { authenticator, beginGoogleSignIn, exchangeOAuthCode } = buildAuthenticator()

    await launchExtensionGoogleAuth(authenticator)

    expect(beginGoogleSignIn).toHaveBeenCalledWith(redirectUri)
    expect(exchangeOAuthCode).toHaveBeenCalledWith('auth-code-123', 'verifier-1', redirectUri)
  })

  it('refuses a callback with a different state', async () => {
    stubChromeIdentity(`${redirectUri}?code=auth-code-123&state=forged`)
    const { authenticator, exchangeOAuthCode } = buildAuthenticator()

    await expect(launchExtensionGoogleAuth(authenticator)).rejects.toThrow('OAuth state')
    expect(exchangeOAuthCode).not.toHaveBeenCalled()
  })

  it('shows the error returned by the provider', async () => {
    stubChromeIdentity(
      `${redirectUri}?error=access_denied&error_description=Login+cancelled&state=state-1`,
    )
    const { authenticator } = buildAuthenticator()

    await expect(launchExtensionGoogleAuth(authenticator)).rejects.toThrow('Login cancelled')
  })
})
