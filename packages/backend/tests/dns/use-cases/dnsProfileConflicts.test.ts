import { describe, expect, it } from 'vitest'
import type { DnsSettingsStore } from '../../../src/dns/contracts/DnsSettingsStore'
import { ChangeDnsTimeZoneUseCase } from '../../../src/dns/use-cases/ChangeDnsTimeZoneUseCase'
import { CreateDnsProfileUseCase } from '../../../src/dns/use-cases/CreateDnsProfileUseCase'
import { EnsureDnsProfileUseCase } from '../../../src/dns/use-cases/EnsureDnsProfileUseCase'
import { RotateDnsTokenUseCase } from '../../../src/dns/use-cases/RotateDnsTokenUseCase'
import { ConflictError } from '../../../src/domain/errors/ConflictError'
import { buildDnsSettings } from '../../helpers/dns/buildDnsSettings'
import { listValidTokens } from '../../helpers/dns/listValidTokens'
import { RivalCreatesBeforeCreateDnsSettingsStore } from '../../helpers/dns/RivalCreatesBeforeCreateDnsSettingsStore'
import { RivalRotatesAfterReadDnsSettingsStore } from '../../helpers/dns/RivalRotatesAfterReadDnsSettingsStore'
import { backendFactories } from '../../helpers/testBackends'
import { useTestBackend } from '../../helpers/useTestBackend'

const everyToken = ['token-own', 'token-rival']

describe.each(backendFactories)('dns profile conflicts ($name)', (factory) => {
  const backend = useTestBackend(factory)

  function buildEnsureDnsProfile(dnsSettingsStore: DnsSettingsStore) {
    return new EnsureDnsProfileUseCase(
      dnsSettingsStore,
      new CreateDnsProfileUseCase(dnsSettingsStore, () => 'token-own', backend().clock.now),
      new ChangeDnsTimeZoneUseCase(dnsSettingsStore),
    )
  }

  it('reapplies the requested time zone after losing the creation race', async () => {
    const rivalSettings = buildDnsSettings('token-rival', 'UTC')
    const ensureDnsProfile = buildEnsureDnsProfile(
      new RivalCreatesBeforeCreateDnsSettingsStore(backend().dnsSettingsStore, rivalSettings),
    )
    const reply = await ensureDnsProfile.ensureDnsProfile('user-1', 'Europe/Lisbon')
    expect(reply).toMatchObject({ token: 'token-rival', timeZone: 'Europe/Lisbon' })
    expect((await backend().dnsSettingsStore.findDnsSettings('user-1'))?.timeZone).toBe('Europe/Lisbon')
    expect(await listValidTokens(backend(), everyToken)).toEqual(['token-rival'])
  })

  it('answers conflict when a rival rotation lands between the read and the rotation', async () => {
    await backend().dnsSettingsStore.createDnsSettings('user-1', buildDnsSettings('token-original'))
    const rotateDnsToken = new RotateDnsTokenUseCase(
      new RivalRotatesAfterReadDnsSettingsStore(backend().dnsSettingsStore, buildDnsSettings('token-rival')),
      () => 'token-own',
      backend().clock.now,
    )
    await expect(rotateDnsToken.rotateDnsToken('user-1')).rejects.toBeInstanceOf(ConflictError)
    expect(await listValidTokens(backend(), ['token-original', ...everyToken])).toEqual(['token-rival'])
  })

  it('answers conflict when a rival rotation lands before the time zone change', async () => {
    await backend().dnsSettingsStore.createDnsSettings('user-1', buildDnsSettings('token-original'))
    const racingStore = new RivalRotatesAfterReadDnsSettingsStore(
      backend().dnsSettingsStore,
      buildDnsSettings('token-rival'),
    )
    const ensureDnsProfile = new EnsureDnsProfileUseCase(
      racingStore,
      new CreateDnsProfileUseCase(racingStore, () => 'token-own', backend().clock.now),
      new ChangeDnsTimeZoneUseCase(racingStore),
    )
    await expect(ensureDnsProfile.ensureDnsProfile('user-1', 'Europe/Lisbon')).rejects.toBeInstanceOf(ConflictError)
    expect((await backend().dnsSettingsStore.findDnsSettings('user-1'))?.timeZone).toBe('UTC')
  })
})
