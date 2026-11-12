import { describe, expect, it, vi } from 'vitest'
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
