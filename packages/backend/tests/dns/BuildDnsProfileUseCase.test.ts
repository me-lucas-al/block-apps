import { describe, expect, it } from 'vitest'
import { BuildDnsProfileUseCase } from '../../src/dns/use-cases/BuildDnsProfileUseCase'
import { NotFoundError } from '../../src/domain/errors/NotFoundError'
import { InMemoryRuleDatabase } from '../helpers/InMemoryRuleDatabase'

describe('BuildDnsProfileUseCase', () => {
  it('throws NotFoundError when dnsHost is not configured', async () => {
    const store = new InMemoryRuleDatabase()
    await store.createDnsSettings('user-1', {
      token: 'tok-1',
      timeZone: 'UTC',
      createdAt: '2026-11-18T12:00:00.000Z',
    })
    const useCase = new BuildDnsProfileUseCase(store, null)

    await expect(useCase.buildDnsProfileFor('user-1')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('throws NotFoundError when the user has no DNS profile', async () => {
    const store = new InMemoryRuleDatabase()
    const useCase = new BuildDnsProfileUseCase(store, 'dns.example.test')

    await expect(useCase.buildDnsProfileFor('user-1')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('builds the XML profile using the stored token and configured host', async () => {
    const store = new InMemoryRuleDatabase()
    await store.createDnsSettings('user-1', {
      token: 'tok-99',
      timeZone: 'America/Sao_Paulo',
      createdAt: '2026-11-18T12:00:00.000Z',
    })
    const useCase = new BuildDnsProfileUseCase(store, 'dns.example.test')

    const xml = await useCase.buildDnsProfileFor('user-1')
    expect(xml).toContain('https://dns.example.test/dns-query/tok-99')
  })
})
