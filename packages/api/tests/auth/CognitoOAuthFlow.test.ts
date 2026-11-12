import { describe, expect, it, vi } from 'vitest'
import { CognitoOAuthFlow } from '../../src/auth/cognito/CognitoOAuthFlow'

describe('CognitoOAuthFlow', () => {
  it('builds google authorize url and saves pkce verifier', async () => {
    const fakeSessionStorage = new Map<string, string>()
    vi.stubGlobal('sessionStorage', {
      setItem: (key: string, value: string) => fakeSessionStorage.set(key, value),
      getItem: (key: string) => fakeSessionStorage.get(key) ?? null,
      removeItem: (key: string) => fakeSessionStorage.delete(key),
    })

    const flow = new CognitoOAuthFlow({
      userPoolId: 'pool-1',
      clientId: 'client-1',
      hostedDomain: 'auth.example.com',
    })

    const url = await flow.buildGoogleAuthorizeUrl('https://app.test/callback')
    expect(url).toContain('code_challenge=')
    expect(fakeSessionStorage.has('block_apps_pkce_verifier')).toBe(true)
  })

  it('exchanges authorization code using saved verifier', async () => {
    const fakeIdPayload = btoa(JSON.stringify({ email: 'user@oauth.com' }))
    const fakeIdToken = `header.${fakeIdPayload}.signature`

    const fakeSessionStorage = new Map<string, string>([
      ['block_apps_pkce_verifier', 'saved-verifier-xyz'],
    ])
    vi.stubGlobal('sessionStorage', {
      setItem: (key: string, value: string) => fakeSessionStorage.set(key, value),
      getItem: (key: string) => fakeSessionStorage.get(key) ?? null,
      removeItem: (key: string) => fakeSessionStorage.delete(key),
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'acc-token',
          id_token: fakeIdToken,
          refresh_token: 'ref-token',
        }),
        { status: 200 },
      ),
    ))

    const flow = new CognitoOAuthFlow({
      userPoolId: 'pool-1',
      clientId: 'client-1',
      hostedDomain: 'auth.example.com',
    })

    const tokens = await flow.exchangeCode('code-123', 'https://app.test/callback')
    expect(tokens.email).toBe('user@oauth.com')
    expect(fakeSessionStorage.has('block_apps_pkce_verifier')).toBe(false)
  })
})
