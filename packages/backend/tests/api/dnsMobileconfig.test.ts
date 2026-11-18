import { describe, expect, it } from 'vitest'
import { callApi, callRawApi } from '../helpers/callApi'
import { extractPayloadUuids } from '../helpers/extractPayloadUuids'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

describe.each(backendFactories)('dns mobileconfig ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('returns the mobileconfig plist after profile creation with Apple headers', async () => {
    await callApi(backend().app, {
      method: 'POST',
      path: '/dns/profile',
      body: { timeZone: 'America/Sao_Paulo' },
    })

    const reply = await callRawApi(backend().app, {
      method: 'GET',
      path: '/dns/profile.mobileconfig',
    })

    expect(reply.status).toBe(200)
    expect(reply.headers.get('content-type')).toBe('application/x-apple-aspen-config; charset=utf-8')
    expect(reply.headers.get('content-disposition')).toBe('attachment; filename="block-apps-dns.mobileconfig"')
    expect(reply.headers.get('cache-control')).toBe('no-store')
    expect(reply.text).toContain('<string>https://dns.example.test/dns-query/test-token-1</string>')
  })

  it('updates ServerURL while keeping stable UUIDs after token rotation', async () => {
    await callApi(backend().app, {
      method: 'POST',
      path: '/dns/profile',
      body: { timeZone: 'America/Sao_Paulo' },
    })
    const before = await callRawApi(backend().app, { method: 'GET', path: '/dns/profile.mobileconfig' })

    await callApi(backend().app, { method: 'POST', path: '/dns/rotate' })
    const after = await callRawApi(backend().app, { method: 'GET', path: '/dns/profile.mobileconfig' })

    expect(after.status).toBe(200)
    expect(after.text).toContain('<string>https://dns.example.test/dns-query/test-token-2</string>')
    expect(extractPayloadUuids(after.text)).toEqual(extractPayloadUuids(before.text))
  })

  it('answers not found when no profile exists yet', async () => {
    const reply = await callApi(backend().app, { method: 'GET', path: '/dns/profile.mobileconfig' })
    expect(reply.status).toBe(404)
  })

  it('requires a signed in user', async () => {
    const reply = await callApi(backend().app, {
      method: 'GET',
      path: '/dns/profile.mobileconfig',
      userId: null,
    })
    expect(reply.status).toBe(401)
  })
})
