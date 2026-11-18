import { describe, expect, it } from 'vitest'
import { hashDnsToken } from '../../src/dns/token/hashDnsToken'
import { callApi } from '../helpers/callApi'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

function postProfile(backend: { app: Parameters<typeof callApi>[0] }, timeZone: unknown, userId = 'user-1') {
  return callApi(backend.app, { method: 'POST', path: '/dns/profile', body: { timeZone }, userId })
}

function rotate(backend: { app: Parameters<typeof callApi>[0] }, userId = 'user-1') {
  return callApi(backend.app, { method: 'POST', path: '/dns/rotate', userId })
}

describe.each(backendFactories)('dns profile ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('creates a profile with a token, the time zone and the creation time', async () => {
    const reply = await postProfile(backend(), 'America/Sao_Paulo')
    expect(reply.status).toBe(200)
    expect(reply.json).toEqual({
      token: 'test-token-1',
      timeZone: 'America/Sao_Paulo',
      createdAt: '2026-11-11T12:00:00.000Z',
    })
  })

  it('looks the user up by the token hash only', async () => {
    await postProfile(backend(), 'America/Sao_Paulo')
    const { dnsSettingsStore } = backend()
    expect(await dnsSettingsStore.findUserIdByDnsTokenHash(hashDnsToken('test-token-1'))).toBe('user-1')
    expect(await dnsSettingsStore.findUserIdByDnsTokenHash('test-token-1')).toBeNull()
  })

  it('returns the same token when the profile already exists', async () => {
    const first = await postProfile(backend(), 'America/Sao_Paulo')
    const second = await postProfile(backend(), 'America/Sao_Paulo')
    expect(second.json).toEqual(first.json)
  })

  it('updates the time zone without changing the token', async () => {
    await postProfile(backend(), 'America/Sao_Paulo')
    const reply = await postProfile(backend(), 'Europe/Lisbon')
    expect(reply.json).toMatchObject({ token: 'test-token-1', timeZone: 'Europe/Lisbon' })
    const userId = await backend().dnsSettingsStore.findUserIdByDnsTokenHash(hashDnsToken('test-token-1'))
    expect(userId).toBe('user-1')
  })

  it('rotates the token and stops recognizing the old one', async () => {
    await postProfile(backend(), 'America/Sao_Paulo')
    const reply = await rotate(backend())
    expect(reply.json).toMatchObject({ token: 'test-token-2', timeZone: 'America/Sao_Paulo' })
    const { dnsSettingsStore } = backend()
    expect(await dnsSettingsStore.findUserIdByDnsTokenHash(hashDnsToken('test-token-1'))).toBeNull()
    expect(await dnsSettingsStore.findUserIdByDnsTokenHash(hashDnsToken('test-token-2'))).toBe('user-1')
  })

  it('answers not found when rotating without a profile', async () => {
    expect((await rotate(backend())).status).toBe(404)
  })

  it('keeps each user with their own token', async () => {
    const first = await postProfile(backend(), 'America/Sao_Paulo', 'user-1')
    const second = await postProfile(backend(), 'America/Sao_Paulo', 'user-2')
    expect(first.json).not.toEqual(second.json)
  })

  it.each([
    ['an invalid time zone', 'Mars/Olympus'],
    ['a legacy abbreviation', 'EST'],
    ['a fixed offset', '+03:00'],
    ['an empty time zone', ''],
    ['a missing time zone', undefined],
  ])('rejects %s', async (_label, timeZone) => {
    expect((await postProfile(backend(), timeZone)).status).toBe(400)
  })

  it('stores the canonical name of the time zone', async () => {
    const reply = await postProfile(backend(), 'america/sao_paulo')
    expect(reply.json).toMatchObject({ timeZone: 'America/Sao_Paulo' })
  })

  it('accepts UTC', async () => {
    const reply = await postProfile(backend(), 'UTC')
    expect(reply.status).toBe(200)
  })

  it('requires a signed in user', async () => {
    const reply = await callApi(backend().app, { method: 'POST', path: '/dns/rotate', userId: null })
    expect(reply.status).toBe(401)
  })
})
