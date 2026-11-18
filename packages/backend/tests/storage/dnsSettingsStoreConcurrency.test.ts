import { describe, expect, it } from 'vitest'
import type { DnsSettings } from '../../src/dns/contracts/DnsSettingsStore'
import { hashDnsToken } from '../../src/dns/token/hashDnsToken'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

const FIRST: DnsSettings = { token: 'token-1', timeZone: 'UTC', createdAt: '2026-11-11T12:00:00.000Z' }
const SECOND: DnsSettings = { ...FIRST, token: 'token-2' }
const THIRD: DnsSettings = { ...FIRST, token: 'token-3' }

describe.each(backendFactories)('dns settings store ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('creates the settings only once per user', async () => {
    const { dnsSettingsStore } = backend()
    expect(await dnsSettingsStore.createDnsSettings('user-1', FIRST)).toBe(true)
    expect(await dnsSettingsStore.createDnsSettings('user-1', SECOND)).toBe(false)
    expect((await dnsSettingsStore.findDnsSettings('user-1'))?.token).toBe('token-1')
    expect(await dnsSettingsStore.findUserIdByDnsTokenHash(hashDnsToken('token-2'))).toBeNull()
  })

  it('refuses to rotate from a token that is no longer current and leaves no lookup behind', async () => {
    const { dnsSettingsStore } = backend()
    await dnsSettingsStore.createDnsSettings('user-1', FIRST)
    expect(await dnsSettingsStore.replaceDnsToken('user-1', FIRST, SECOND)).toBe(true)
    expect(await dnsSettingsStore.replaceDnsToken('user-1', FIRST, THIRD)).toBe(false)
    expect(await dnsSettingsStore.findUserIdByDnsTokenHash(hashDnsToken('token-3'))).toBeNull()
    expect(await dnsSettingsStore.findUserIdByDnsTokenHash(hashDnsToken('token-2'))).toBe('user-1')
    expect(await dnsSettingsStore.findUserIdByDnsTokenHash(hashDnsToken('token-1'))).toBeNull()
  })

  it('refuses a time zone change made from a stale token', async () => {
    const { dnsSettingsStore } = backend()
    await dnsSettingsStore.createDnsSettings('user-1', FIRST)
    await dnsSettingsStore.replaceDnsToken('user-1', FIRST, SECOND)
    expect(await dnsSettingsStore.changeDnsTimeZone('user-1', FIRST, 'Europe/Lisbon')).toBe(false)
    expect((await dnsSettingsStore.findDnsSettings('user-1'))?.timeZone).toBe('UTC')
    expect(await dnsSettingsStore.changeDnsTimeZone('user-1', SECOND, 'Europe/Lisbon')).toBe(true)
  })
})
