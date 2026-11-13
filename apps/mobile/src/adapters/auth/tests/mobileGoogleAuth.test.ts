import type { Authenticator } from '@block-apps/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { launchMobileGoogleAuth } from '../mobileGoogleAuth'

const openAuthSessionAsync = vi.fn()

vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync: (...args: unknown[]) => openAuthSessionAsync(...args),
}))

vi.mock('expo-auth-session', () => ({
  makeRedirectUri: () => 'blockapps://auth',
}))

function buildAuthenticator() {
  const beginGoogleSignIn = vi.fn().mockResolvedValue({
    url: 'https://auth.test/authorize',
    verifier: 'verifier-1',
    state: 'state-1',
  })
  const exchangeOAuthCode = vi.fn().mockResolvedValue(undefined)
  const authenticator = { beginGoogleSignIn, exchangeOAuthCode } as unknown as Authenticator
  return { authenticator, exchangeOAuthCode }
}

describe('launchMobileGoogleAuth', () => {
  beforeEach(() => openAuthSessionAsync.mockReset())

  it('exchanges the received code with the verifier of the same sign in', async () => {
    openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'blockapps://auth?code=mobile-oauth-code&state=state-1',
    })
    const { authenticator, exchangeOAuthCode } = buildAuthenticator()

    await launchMobileGoogleAuth(authenticator)

    expect(exchangeOAuthCode).toHaveBeenCalledWith(
      'mobile-oauth-code',
      'verifier-1',
      'blockapps://auth',
    )
  })

  it('refuses a callback with a different state', async () => {
    openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'blockapps://auth?code=mobile-oauth-code&state=forged',
    })
    const { authenticator, exchangeOAuthCode } = buildAuthenticator()

    await expect(launchMobileGoogleAuth(authenticator)).rejects.toThrow('OAuth state')
    expect(exchangeOAuthCode).not.toHaveBeenCalled()
  })

  it('does nothing when the user dismisses the browser', async () => {
    openAuthSessionAsync.mockResolvedValue({ type: 'dismiss' })
    const { authenticator, exchangeOAuthCode } = buildAuthenticator()

    await launchMobileGoogleAuth(authenticator)

    expect(exchangeOAuthCode).not.toHaveBeenCalled()
  })

  it('shows the error returned by the provider', async () => {
    openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'blockapps://auth?error=access_denied&error_description=Login+cancelled',
    })
    const { authenticator } = buildAuthenticator()

    await expect(launchMobileGoogleAuth(authenticator)).rejects.toThrow('Login cancelled')
  })
})
