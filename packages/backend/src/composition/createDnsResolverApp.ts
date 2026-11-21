import type { DnsSettingsStore } from '../dns/contracts/DnsSettingsStore'
import type { DnsTokenLookup } from '../dns/contracts/DnsTokenLookup'
import type { DohUpstream } from '../dns/contracts/DohUpstream'
import type { SiteRuleReader } from '../dns/contracts/SiteRuleReader'
import { UserDnsStateCache } from '../dns/resolver/UserDnsStateCache'
import { FetchDohUpstream } from '../dns/upstream/FetchDohUpstream'
import { ResolveDohQueryUseCase } from '../dns/use-cases/ResolveDohQueryUseCase'
import type { Clock } from '../domain/time/Clock'
import { createDnsApp } from '../http/app/createDnsApp'

export function createDnsResolverApp(
  dnsSettingsStore: DnsSettingsStore,
  dnsTokenLookup: DnsTokenLookup,
  siteRuleReader: SiteRuleReader,
  upstream: DohUpstream = new FetchDohUpstream(),
  clock: Clock = () => new Date(),
) {
  const stateCache = new UserDnsStateCache(dnsTokenLookup, dnsSettingsStore, siteRuleReader)
  const resolveQuery = new ResolveDohQueryUseCase(stateCache, upstream, clock)
  return createDnsApp(resolveQuery)
}
