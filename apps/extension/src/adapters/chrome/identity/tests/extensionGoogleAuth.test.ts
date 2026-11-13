import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { launchExtensionGoogleAuth } from '../extensionGoogleAuth'
import type { Authenticator } from '@block-apps/api'

describe('launchExtensionGoogleAuth', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.test')
    vi.stubEnv('VITE_COGNITO_USER_POOL_ID', 'pool-test')
    vi.stubEnv('VITE_COGNITO_CLIENT_ID', 'client-test')
    vi.stubEnv('VITE_COGNITO_HOSTED_DOMAIN', 'auth.test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('launches web auth flow and exchanges received code', async () => {
    vi.stubGlobal('chrome', {
      identity: {
        getRedirectURL: () => 'https://mockextensionid.chromiumapp.org/',
        launchWebAuthFlow: (
          _details: { url: string; interactive: boolean },
          callback: (url?: string) => void,
        ) => {
          callback('https://mockextensionid.chromiumapp.org/?code=auth-code-123')
        },
      },
      runtime: { lastError: null },
    })

    const exchangeMock = vi.fn().mockResolvedValue(undefined)
    const authenticator: Partial<Authenticator> = {
      exchangeOAuthCode: exchangeMock,
    }

    await launchExtensionGoogleAuth(authenticator as Authenticator)
    expect(exchangeMock).toHaveBeenCalledWith(
      'auth-code-123',
      undefined,
      'https://mockextensionid.chromiumapp.org/',
    )
  })
})
