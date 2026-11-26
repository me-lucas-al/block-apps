import { describe, expect, it } from 'vitest'
import { callApi } from '../../helpers/callApi'
import { postDnsProfile, postRotateDnsToken } from '../../helpers/dns/dnsRequests'
import { findOwnerOfToken } from '../../helpers/dns/findOwnerOfToken'
import { backendFactories } from '../../helpers/testBackends'
import { useTestBackend } from '../../helpers/useTestBackend'

describe.each(backendFactories)('dns token rotation ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('rotates the token and invalidates the old one right away', async () => {
    await postDnsProfile(backend(), 'America/Sao_Paulo')
    const reply = await postRotateDnsToken(backend())
    expect(reply.json).toMatchObject({ token: 'test-token-2', timeZone: 'America/Sao_Paulo' })
    expect(await findOwnerOfToken(backend(), 'test-token-1')).toBeNull()
    expect(await findOwnerOfToken(backend(), 'test-token-2')).toBe('user-1')
  })

  it('keeps createdAt and records the rotation time in tokenCreatedAt', async () => {
    await postDnsProfile(backend(), 'America/Sao_Paulo')
    backend().clock.advanceHours(5)
    const reply = await postRotateDnsToken(backend())
    expect(reply.json).toMatchObject({
      createdAt: '2026-11-11T12:00:00.000Z',
      tokenCreatedAt: '2026-11-11T17:00:00.000Z',
    })
    const stored = await backend().dnsSettingsStore.findDnsSettings('user-1')
    expect(stored).toMatchObject({ createdAt: '2026-11-11T12:00:00.000Z', tokenCreatedAt: '2026-11-11T17:00:00.000Z' })
  })

  it('does not affect the lookup of another user', async () => {
    await postDnsProfile(backend(), 'UTC', 'user-1')
    await postDnsProfile(backend(), 'UTC', 'user-2')
    await postRotateDnsToken(backend(), 'user-1')
    expect(await findOwnerOfToken(backend(), 'test-token-2')).toBe('user-2')
    expect(await findOwnerOfToken(backend(), 'test-token-1')).toBeNull()
    expect(await findOwnerOfToken(backend(), 'test-token-3')).toBe('user-1')
  })

  it('answers not found when rotating without a profile', async () => {
    expect((await postRotateDnsToken(backend())).status).toBe(404)
  })

  it('requires a signed in user', async () => {
    const reply = await callApi(backend().app, { method: 'POST', path: '/dns/rotate', userId: null })
    expect(reply.status).toBe(401)
  })
})
