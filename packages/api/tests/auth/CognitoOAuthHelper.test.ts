import { describe, expect, it, vi } from 'vitest'
import { CognitoOAuthHelper } from '../../src/auth/cognito/CognitoOAuthHelper'

describe('CognitoOAuthHelper', () => {
  it('builds authorize url with parameters', () => {
    const helper = new CognitoOAuthHelper({
      userPoolId: 'pool-1',
      clientId: 'client-1',
      hostedDomain: 'auth.example.com',
    })

    const url = helper.buildAuthorizeUrl('https://app.test/callback', 'challenge-xyz', 'state-abc')
    expect(url).toContain('https://auth.example.com/oauth2/authorize?')
    expect(url).toContain('client_id=client-1')
    expect(url).toContain('code_challenge=challenge-xyz')
    expect(url).toContain('identity_provider=Google')
    expect(url).toContain('state=state-abc')
  })

  it('exchanges code for tokens', async () => {
    const fakeIdPayload = btoa(JSON.stringify({ email: 'oauth@example.com' }))
    const fakeIdToken = `header.${fakeIdPayload}.signature`

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'acc-1',
          id_token: fakeIdToken,
          refresh_token: 'ref-1',
        }),
        { status: 200 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const helper = new CognitoOAuthHelper({
      userPoolId: 'pool-1',
      clientId: 'client-1',
      hostedDomain: 'auth.example.com',
    })

    const tokens = await helper.exchangeAuthorizationCode('code-123', 'verifier-123', 'https://app.test')
    expect(tokens.email).toBe('oauth@example.com')
    expect(tokens.accessToken).toBe('acc-1')
    expect(tokens.refreshToken).toBe('ref-1')
  })

  it('rejects an id token that carries no email', async () => {
    const tokenWithoutEmail = `header.${btoa(JSON.stringify({ sub: 'user-1' }))}.signature`
    const tokenReply = { access_token: 'acc-1', id_token: tokenWithoutEmail, refresh_token: 'ref-1' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(tokenReply))))

    const helper = new CognitoOAuthHelper({
      userPoolId: 'pool-1',
      clientId: 'client-1',
      hostedDomain: 'auth.example.com',
    })

    await expect(
      helper.exchangeAuthorizationCode('code-123', 'verifier-123', 'https://app.test'),
    ).rejects.toThrow('OAuth id token has no email')
  })
})
