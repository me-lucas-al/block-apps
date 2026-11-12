import { describe, expect, it, vi } from 'vitest'
import { launchExtensionGoogleAuth } from '../extensionGoogleAuth'
import type { Authenticator } from '@block-apps/api'

describe('launchExtensionGoogleAuth', () => {
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
