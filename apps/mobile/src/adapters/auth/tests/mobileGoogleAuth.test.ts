import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { launchMobileGoogleAuth } from '../mobileGoogleAuth'
import type { Authenticator } from '@block-apps/api'

vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync: vi.fn(async () => ({
    type: 'success',
    url: 'blockapps://auth?code=mobile-oauth-code',
  })),
}))

vi.mock('expo-auth-session', () => ({
  makeRedirectUri: () => 'blockapps://auth',
}))

describe('launchMobileGoogleAuth', () => {
  beforeEach(() => {
    vi.stubEnv('EXPO_PUBLIC_API_URL', 'https://api.test')
    vi.stubEnv('EXPO_PUBLIC_COGNITO_USER_POOL_ID', 'pool-test')
    vi.stubEnv('EXPO_PUBLIC_COGNITO_CLIENT_ID', 'client-test')
    vi.stubEnv('EXPO_PUBLIC_COGNITO_HOSTED_DOMAIN', 'auth.test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('opens auth session and exchanges received code', async () => {
    const exchangeMock = vi.fn().mockResolvedValue(undefined)
    const authenticator: Partial<Authenticator> = {
      exchangeOAuthCode: exchangeMock,
    }

    await launchMobileGoogleAuth(authenticator as Authenticator)
    expect(exchangeMock).toHaveBeenCalledWith(
      'mobile-oauth-code',
      expect.any(String),
      'blockapps://auth',
    )
  })
})
