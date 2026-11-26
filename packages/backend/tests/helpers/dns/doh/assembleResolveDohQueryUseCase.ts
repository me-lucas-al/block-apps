import { vi } from 'vitest'
import type { DohUpstream } from '../../../../src/dns/contracts/DohUpstream'
import type { DnsTokenLookup } from '../../../../src/dns/contracts/DnsTokenLookup'
import type { SiteRuleReader } from '../../../../src/dns/contracts/SiteRuleReader'
import { UserDnsStateCache } from '../../../../src/dns/resolver/UserDnsStateCache'
import { ResolveDohQueryUseCase } from '../../../../src/dns/use-cases/ResolveDohQueryUseCase'
import { InMemoryDnsSettingsStore } from '../../InMemoryDnsSettingsStore'
import { InMemoryRuleDatabase } from '../../InMemoryRuleDatabase'
import { buildDnsSettings } from '../buildDnsSettings'
import { RESOLVER_TEST_TOKEN } from './seedDnsProfile'

export type ResolverOptions = {
  readonly upstream?: DohUpstream
  readonly tokenLookup?: DnsTokenLookup
  readonly siteRuleReader?: SiteRuleReader
  readonly timeZone?: string
  readonly now?: Date
}

const DEFAULT_NOW = new Date('2026-11-19T15:00:00Z')

export async function assembleResolveDohQueryUseCase(options: ResolverOptions = {}) {
  const ruleDatabase = new InMemoryRuleDatabase()
  const dnsStore = new InMemoryDnsSettingsStore()
  await dnsStore.createDnsSettings(
    'user-1',
    buildDnsSettings(RESOLVER_TEST_TOKEN, options.timeZone ?? 'America/Sao_Paulo'),
  )
  const upstream: DohUpstream = options.upstream ?? { forwardQuery: vi.fn(async (query) => query) }
  const userDnsStateCache = new UserDnsStateCache(
    options.tokenLookup ?? dnsStore,
    dnsStore,
    options.siteRuleReader ?? ruleDatabase,
  )
  const resolveDohQueryUseCase = new ResolveDohQueryUseCase(
    userDnsStateCache,
    upstream,
    () => options.now ?? DEFAULT_NOW,
  )
  return { resolveDohQueryUseCase, upstream, ruleDatabase, dnsStore }
}

export async function blockSiteAlways(ruleDatabase: InMemoryRuleDatabase, domain: string) {
  await ruleDatabase.insert('user-1', {
    id: `site~${domain}`,
    targetType: 'site',
    target: domain,
    mode: 'always',
    windows: [],
  })
}
