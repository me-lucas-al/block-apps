import { afterEach, describe, expect, it, vi } from 'vitest'
import { CognitoOAuthFlow } from '../../src/auth/cognito/CognitoOAuthFlow'

const hostedConfig = {
  userPoolId: 'pool-1',
  clientId: 'client-1',
  hostedDomain: 'auth.example.com',
}

describe('CognitoOAuthFlow', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns the authorize url together with verifier and state', async () => {
    const flow = new CognitoOAuthFlow(hostedConfig)

    const authorization = await flow.buildGoogleAuthorizeUrl('https://app.test/callback')

    const params = new URL(authorization.url).searchParams
    expect(params.get('code_challenge')).toBeTruthy()
    expect(params.get('state')).toBe(authorization.state)
    expect(authorization.verifier).toHaveLength(64)
    expect(authorization.state).toHaveLength(32)
  })

  it('generates a different verifier and state on every call', async () => {
    const flow = new CognitoOAuthFlow(hostedConfig)

    const first = await flow.buildGoogleAuthorizeUrl('https://app.test/callback')
    const second = await flow.buildGoogleAuthorizeUrl('https://app.test/callback')

    expect(first.verifier).not.toBe(second.verifier)
    expect(first.state).not.toBe(second.state)
  })

  it('generates the pkce values with the injected crypto', async () => {
    const injectedCrypto = {
      randomBytes: (length: number) => new Uint8Array(length).fill(3),
      sha256Base64: async () => 'injected-digest',
    }
    const flow = new CognitoOAuthFlow(hostedConfig, injectedCrypto)

    const authorization = await flow.buildGoogleAuthorizeUrl('https://app.test/callback')

    expect(authorization.verifier).toBe('D'.repeat(64))
    expect(new URL(authorization.url).searchParams.get('code_challenge')).toBe('injected-digest')
  })

  it('exchanges the authorization code using the explicit verifier', async () => {
    const idToken = `header.${btoa(JSON.stringify({ email: 'user@oauth.com' }))}.signature`
    const tokenReply = { access_token: 'acc-token', id_token: idToken, refresh_token: 'ref-token' }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(tokenReply)))
    vi.stubGlobal('fetch', fetchMock)

    const tokens = await new CognitoOAuthFlow(hostedConfig).exchangeCode(
      'code-123',
      'https://app.test/callback',
      'explicit-verifier',
    )

    expect(tokens.email).toBe('user@oauth.com')
    expect(String(fetchMock.mock.calls[0]![1].body)).toContain('code_verifier=explicit-verifier')
  })

  it('refuses to exchange the code without a verifier', async () => {
    const flow = new CognitoOAuthFlow(hostedConfig)

    await expect(flow.exchangeCode('code-123', 'https://app.test/callback', '')).rejects.toThrow(
      'PKCE code verifier is missing',
    )
  })
})
