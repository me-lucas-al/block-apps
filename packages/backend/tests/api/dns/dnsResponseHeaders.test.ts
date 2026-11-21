import { describe, expect, it } from 'vitest'
import { buildLambdaBindings } from '../../helpers/buildLambdaBindings'
import { postDnsProfile } from '../../helpers/dns/dnsRequests'
import { backendFactories } from '../../helpers/testBackends'
import { useTestBackend } from '../../helpers/useTestBackend'

describe.each(backendFactories)('dns response headers ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('forbids caching and sniffing of the profile response that carries the token', async () => {
    const reply = await backend().app.request(
      '/dns/profile',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ timeZone: 'UTC' }),
      },
      buildLambdaBindings('user-1'),
    )
    expect(reply.status).toBe(200)
    expect(reply.headers.get('cache-control')).toBe('private, no-store')
    expect(reply.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('forbids caching of the rotation response that carries the token', async () => {
    await postDnsProfile(backend(), 'UTC')
    const reply = await backend().app.request(
      '/dns/rotate',
      { method: 'POST' },
      buildLambdaBindings('user-1'),
    )
    expect(reply.status).toBe(200)
    expect(reply.headers.get('cache-control')).toBe('private, no-store')
    expect(reply.headers.get('x-content-type-options')).toBe('nosniff')
  })
})
