import { describe, expect, it } from 'vitest'
import { BuildDnsProfileUseCase } from '../../src/dns/use-cases/BuildDnsProfileUseCase'
import { NotFoundError } from '../../src/domain/errors/NotFoundError'
import { InMemoryDnsSettingsStore } from '../helpers/InMemoryDnsSettingsStore'
import { buildDnsSettings } from '../helpers/dns/buildDnsSettings'
import { UnreachableDnsSettingsStore } from '../helpers/dns/UnreachableDnsSettingsStore'

describe('BuildDnsProfileUseCase', () => {
  it('throws NotFoundError before querying the store when dnsHost is not configured', async () => {
    const useCase = new BuildDnsProfileUseCase(new UnreachableDnsSettingsStore(), undefined)

    await expect(useCase.buildDnsProfileFor('user-1')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('throws NotFoundError when the user has no DNS profile', async () => {
    const store = new InMemoryDnsSettingsStore()
    const useCase = new BuildDnsProfileUseCase(store, 'dns.example.test')

    await expect(useCase.buildDnsProfileFor('user-1')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('builds the XML profile using the stored token and configured host', async () => {
    const store = new InMemoryDnsSettingsStore()
    await store.createDnsSettings('user-1', buildDnsSettings('tok-99', 'America/Sao_Paulo'))
    const useCase = new BuildDnsProfileUseCase(store, 'dns.example.test')

    const xml = await useCase.buildDnsProfileFor('user-1')
    expect(xml).toContain('https://dns.example.test/dns-query/tok-99')
  })
})
