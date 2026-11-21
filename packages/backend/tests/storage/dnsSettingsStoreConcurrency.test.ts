import { describe, expect, it } from 'vitest'
import { buildDnsSettings } from '../helpers/dns/buildDnsSettings'
import { listValidTokens } from '../helpers/dns/listValidTokens'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

const originalSettings = buildDnsSettings('token-original')
const rotatedSettings = buildDnsSettings('token-rotated')
const competingSettings = buildDnsSettings('token-competing')
const everyToken = ['token-original', 'token-rotated', 'token-competing']

function countSuccesses(outcomes: boolean[]): number {
  return outcomes.filter((outcome) => outcome).length
}

describe.each(backendFactories)('dns settings store ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('creates the settings only once per user and leaves no lookup for the loser', async () => {
    const { dnsSettingsStore } = backend()
    expect(await dnsSettingsStore.createDnsSettings('user-1', originalSettings)).toBe(true)
    expect(await dnsSettingsStore.createDnsSettings('user-1', rotatedSettings)).toBe(false)
    expect((await dnsSettingsStore.findDnsSettings('user-1'))?.token).toBe('token-original')
    expect(await listValidTokens(backend(), everyToken)).toEqual(['token-original'])
  })

  it('lets only one of two concurrent creations win', async () => {
    const { dnsSettingsStore } = backend()
    const outcomes = await Promise.all([
      dnsSettingsStore.createDnsSettings('user-1', originalSettings),
      dnsSettingsStore.createDnsSettings('user-1', competingSettings),
    ])
    expect(countSuccesses(outcomes)).toBe(1)
    expect(await listValidTokens(backend(), everyToken)).toHaveLength(1)
  })

  it('refuses to rotate from a token that is no longer current', async () => {
    const { dnsSettingsStore } = backend()
    await dnsSettingsStore.createDnsSettings('user-1', originalSettings)
    expect(await dnsSettingsStore.replaceDnsToken('user-1', originalSettings, rotatedSettings)).toBe(true)
    expect(await dnsSettingsStore.replaceDnsToken('user-1', originalSettings, competingSettings)).toBe(false)
    expect(await listValidTokens(backend(), everyToken)).toEqual(['token-rotated'])
  })

  it('lets only one of two concurrent rotations win', async () => {
    const { dnsSettingsStore } = backend()
    await dnsSettingsStore.createDnsSettings('user-1', originalSettings)
    const outcomes = await Promise.all([
      dnsSettingsStore.replaceDnsToken('user-1', originalSettings, rotatedSettings),
      dnsSettingsStore.replaceDnsToken('user-1', originalSettings, competingSettings),
    ])
    expect(countSuccesses(outcomes)).toBe(1)
    const validTokens = await listValidTokens(backend(), everyToken)
    expect(validTokens).toHaveLength(1)
    expect(validTokens).not.toContain('token-original')
    expect((await dnsSettingsStore.findDnsSettings('user-1'))?.token).toBe(validTokens[0])
  })

  it('lets only one of a concurrent rotation and time zone change win', async () => {
    const { dnsSettingsStore } = backend()
    await dnsSettingsStore.createDnsSettings('user-1', originalSettings)
    const outcomes = await Promise.all([
      dnsSettingsStore.replaceDnsToken('user-1', originalSettings, rotatedSettings),
      dnsSettingsStore.changeDnsTimeZone('user-1', originalSettings, 'Europe/Lisbon'),
    ])
    expect(countSuccesses(outcomes)).toBe(1)
    const stored = await dnsSettingsStore.findDnsSettings('user-1')
    const rotationWon = outcomes[0]
    expect(stored?.token).toBe(rotationWon ? 'token-rotated' : 'token-original')
    expect(stored?.timeZone).toBe(rotationWon ? 'UTC' : 'Europe/Lisbon')
    expect(await listValidTokens(backend(), everyToken)).toEqual([stored?.token])
  })

  it('refuses a time zone change made from a stale token', async () => {
    const { dnsSettingsStore } = backend()
    await dnsSettingsStore.createDnsSettings('user-1', originalSettings)
    await dnsSettingsStore.replaceDnsToken('user-1', originalSettings, rotatedSettings)
    expect(await dnsSettingsStore.changeDnsTimeZone('user-1', originalSettings, 'Europe/Lisbon')).toBe(false)
    expect((await dnsSettingsStore.findDnsSettings('user-1'))?.timeZone).toBe('UTC')
    expect(await dnsSettingsStore.changeDnsTimeZone('user-1', rotatedSettings, 'Europe/Lisbon')).toBe(true)
  })

  it('refuses a rotation made from a stale time zone', async () => {
    const { dnsSettingsStore } = backend()
    await dnsSettingsStore.createDnsSettings('user-1', originalSettings)
    await dnsSettingsStore.changeDnsTimeZone('user-1', originalSettings, 'Europe/Lisbon')
    expect(await dnsSettingsStore.replaceDnsToken('user-1', originalSettings, rotatedSettings)).toBe(false)
    expect(await listValidTokens(backend(), everyToken)).toEqual(['token-original'])
  })
})
