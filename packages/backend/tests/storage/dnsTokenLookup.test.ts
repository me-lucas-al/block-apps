import { describe, expect, it } from 'vitest'
import { hashDnsToken } from '../../src/dns/token/hashDnsToken'
import { buildDnsSettings } from '../helpers/dns/buildDnsSettings'
import { findOwnerOfToken } from '../helpers/dns/findOwnerOfToken'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

describe.each(backendFactories)('dns token lookup ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('returns the user and the settings for a valid token hash', async () => {
    const settings = buildDnsSettings('token-valid', 'Europe/Lisbon')
    await backend().dnsSettingsStore.createDnsSettings('user-1', settings)
    const owner = await backend().dnsTokenLookup.findValidatedDnsOwner(hashDnsToken('token-valid'))
    expect(owner).toEqual({ userId: 'user-1', dnsSettings: settings })
  })

  it('does not know a token that was never stored', async () => {
    expect(await findOwnerOfToken(backend(), 'token-unknown')).toBeNull()
  })

  it('does not validate a lookup left behind for a user without DNS settings', async () => {
    await backend().plantOrphanTokenLookup('deleted-user', hashDnsToken('token-orphan'))
    expect(await findOwnerOfToken(backend(), 'token-orphan')).toBeNull()
  })

  it('does not validate a lookup that points to settings holding another token', async () => {
    await backend().dnsSettingsStore.createDnsSettings('user-1', buildDnsSettings('token-current'))
    await backend().plantOrphanTokenLookup('user-1', hashDnsToken('token-stale'))
    expect(await findOwnerOfToken(backend(), 'token-stale')).toBeNull()
    expect(await findOwnerOfToken(backend(), 'token-current')).toBe('user-1')
  })

  it('does not validate the hash of the previous token after a rotation', async () => {
    const currentSettings = buildDnsSettings('token-before')
    await backend().dnsSettingsStore.createDnsSettings('user-1', currentSettings)
    await backend().dnsSettingsStore.replaceDnsToken('user-1', currentSettings, buildDnsSettings('token-after'))
    await backend().plantOrphanTokenLookup('user-1', hashDnsToken('token-before'))
    expect(await findOwnerOfToken(backend(), 'token-before')).toBeNull()
    expect(await findOwnerOfToken(backend(), 'token-after')).toBe('user-1')
  })
})
