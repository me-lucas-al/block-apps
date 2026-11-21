import type { DnsSettingsStore } from '../../dns/contracts/DnsSettingsStore'
import type { DnsTokenLookup } from '../../dns/contracts/DnsTokenLookup'
import type { DohUpstream } from '../../dns/contracts/DohUpstream'
import type { SiteRuleReader } from '../../dns/contracts/SiteRuleReader'
import { UserDnsStateCache } from '../../dns/resolver/UserDnsStateCache'
import { ResolveDohQueryUseCase } from '../../dns/use-cases/ResolveDohQueryUseCase'
import type { Clock } from '../../domain/time/Clock'
import { createDohQueryApp } from '../../http/doh/createDohQueryApp'

export function assembleDohResolverApp(
  dnsSettingsStore: DnsSettingsStore,
  dnsTokenLookup: DnsTokenLookup,
  siteRuleReader: SiteRuleReader,
  upstream: DohUpstream,
  clock: Clock,
) {
  const userDnsStateCache = new UserDnsStateCache(dnsTokenLookup, dnsSettingsStore, siteRuleReader)
  const resolveDohQueryUseCase = new ResolveDohQueryUseCase(userDnsStateCache, upstream, clock)
  return createDohQueryApp(resolveDohQueryUseCase)
}
