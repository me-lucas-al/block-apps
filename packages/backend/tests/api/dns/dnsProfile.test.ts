import { describe, expect, it } from 'vitest'
import { callApi } from '../../helpers/callApi'
import { findOwnerOfToken } from '../../helpers/dns/findOwnerOfToken'
import { postDnsProfile } from '../../helpers/dns/dnsRequests'
import { backendFactories } from '../../helpers/testBackends'
import { useTestBackend } from '../../helpers/useTestBackend'

describe.each(backendFactories)('dns profile ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('creates a profile with a token, the time zone and the creation times', async () => {
    const reply = await postDnsProfile(backend(), 'America/Sao_Paulo')
    expect(reply.status).toBe(200)
    expect(reply.json).toEqual({
      token: 'test-token-1',
      timeZone: 'America/Sao_Paulo',
      createdAt: '2026-11-11T12:00:00.000Z',
      tokenCreatedAt: '2026-11-11T12:00:00.000Z',
    })
  })

  it('validates the token through the lookup of the user that owns it', async () => {
    await postDnsProfile(backend(), 'America/Sao_Paulo')
    expect(await findOwnerOfToken(backend(), 'test-token-1')).toBe('user-1')
    expect(await backend().dnsTokenLookup.findValidatedDnsOwner('test-token-1')).toBeNull()
  })

  it('returns the same token when the profile already exists', async () => {
    const firstReply = await postDnsProfile(backend(), 'America/Sao_Paulo')
    const repeatedReply = await postDnsProfile(backend(), 'America/Sao_Paulo')
    expect(repeatedReply.json).toEqual(firstReply.json)
  })

  it('updates the time zone without changing the token or the times', async () => {
    const firstReply = await postDnsProfile(backend(), 'America/Sao_Paulo')
    const changedReply = await postDnsProfile(backend(), 'Europe/Lisbon')
    expect(changedReply.json).toEqual({ ...(firstReply.json as object), timeZone: 'Europe/Lisbon' })
    expect(await findOwnerOfToken(backend(), 'test-token-1')).toBe('user-1')
    expect((await backend().dnsSettingsStore.findDnsSettings('user-1'))?.timeZone).toBe('Europe/Lisbon')
  })

  it('keeps each user with their own token', async () => {
    const firstUserReply = await postDnsProfile(backend(), 'America/Sao_Paulo', 'user-1')
    const secondUserReply = await postDnsProfile(backend(), 'America/Sao_Paulo', 'user-2')
    expect(firstUserReply.json).not.toEqual(secondUserReply.json)
  })

  it.each([
    ['an invalid time zone', 'Mars/Olympus'],
    ['a legacy abbreviation', 'EST'],
    ['a fixed offset', '+03:00'],
    ['an empty time zone', ''],
    ['a missing time zone', undefined],
    ['a number', 3],
    ['a list', ['UTC']],
  ])('rejects %s', async (_label, timeZone) => {
    expect((await postDnsProfile(backend(), timeZone)).status).toBe(400)
  })

  it('stores the canonical name of the time zone', async () => {
    const reply = await postDnsProfile(backend(), 'america/sao_paulo')
    expect(reply.json).toMatchObject({ timeZone: 'America/Sao_Paulo' })
  })

  it('accepts UTC', async () => {
    expect((await postDnsProfile(backend(), 'UTC')).status).toBe(200)
  })

  it('requires a signed in user', async () => {
    const reply = await callApi(backend().app, { method: 'POST', path: '/dns/profile', userId: null })
    expect(reply.status).toBe(401)
  })
})
