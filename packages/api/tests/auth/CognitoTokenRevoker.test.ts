import { afterEach, describe, expect, it, vi } from 'vitest'
import { CognitoTokenRevoker } from '../../src/auth/cognito/CognitoTokenRevoker'

const hostedConfig = {
  userPoolId: 'pool-1',
  clientId: 'client-1',
  hostedDomain: 'auth.example.com',
}

describe('CognitoTokenRevoker', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('posts the refresh token to the revoke endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await new CognitoTokenRevoker(hostedConfig).revokeRefreshToken('refresh-1')

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://auth.example.com/oauth2/revoke')
    expect(init.method).toBe('POST')
    expect(String(init.body)).toBe('token=refresh-1&client_id=client-1')
  })

  it('fails when the server refuses the revocation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 400 })))

    await expect(new CognitoTokenRevoker(hostedConfig).revokeRefreshToken('refresh-1')).rejects.toThrow(
      'status 400',
    )
  })

  it('fails when the hosted domain is not configured', async () => {
    const revoker = new CognitoTokenRevoker({ userPoolId: 'pool-1', clientId: 'client-1' })

    await expect(revoker.revokeRefreshToken('refresh-1')).rejects.toThrow('hostedDomain')
  })
})
