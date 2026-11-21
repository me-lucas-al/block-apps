import type { DnsSettingsStore } from '../contracts/DnsSettingsStore'
import type { DnsStateProvider, UserDnsState } from '../contracts/DnsStateProvider'
import type { DnsTokenLookup } from '../contracts/DnsTokenLookup'
import type { SiteRuleReader } from '../contracts/SiteRuleReader'
import { hashDnsToken } from '../token/hashDnsToken'
import { DEFAULT_DNS_CACHE_TIMINGS, type DnsCacheTimings } from './dnsCacheTimings'
import { logDnsError } from './logDnsError'
import { recordDnsMetric } from './recordDnsMetric'
import { TtlCache } from './TtlCache'

export class UserDnsStateCache implements DnsStateProvider {
  private readonly userIdCache: TtlCache<string>
  private readonly unknownTokenCache: TtlCache<true>
  private readonly stateCache: TtlCache<UserDnsState>

  constructor(
    private readonly dnsTokenLookup: DnsTokenLookup,
    private readonly dnsSettingsStore: DnsSettingsStore,
    private readonly siteRuleReader: SiteRuleReader,
    timings: DnsCacheTimings = DEFAULT_DNS_CACHE_TIMINGS,
  ) {
    const { staleUsableMs: usableWhenStaleForMs, maxEntriesPerCache: maxEntries } = timings
    this.userIdCache = new TtlCache({ freshForMs: timings.tokenOwnerFreshMs, usableWhenStaleForMs, maxEntries })
    this.unknownTokenCache = new TtlCache({ freshForMs: timings.unknownTokenFreshMs, usableWhenStaleForMs, maxEntries })
    this.stateCache = new TtlCache({ freshForMs: timings.userStateFreshMs, usableWhenStaleForMs, maxEntries })
  }

  async findUserId(token: string, nowMs: number): Promise<string | null> {
    const tokenHash = hashDnsToken(token)
    const cachedUserId = this.userIdCache.readFresh(tokenHash, nowMs)
    if (cachedUserId) return cachedUserId
    if (this.unknownTokenCache.readFresh(tokenHash, nowMs)) return null
    try {
      const owner = await this.dnsTokenLookup.findValidatedDnsOwner(tokenHash)
      if (!owner) {
        this.unknownTokenCache.write(tokenHash, true, nowMs)
        return null
      }
      this.userIdCache.write(tokenHash, owner.userId, nowMs)
      return owner.userId
    } catch (error: unknown) {
      const staleUserId = this.userIdCache.readStale(tokenHash, nowMs)
      if (!staleUserId) throw error
      logDnsError('dns token lookup failed; using stale cache', error)
      return staleUserId
    }
  }

  async readUserState(userId: string, nowMs: number): Promise<UserDnsState | null> {
    const cachedState = this.stateCache.readFresh(userId, nowMs)
    if (cachedState) return cachedState
    try {
      const [rules, settings] = await Promise.all([
        this.siteRuleReader.listSiteRulesByUser(userId),
        this.dnsSettingsStore.findDnsSettings(userId),
      ])
      const freshState: UserDnsState = { rules, timeZone: settings?.timeZone ?? 'UTC' }
      this.stateCache.write(userId, freshState, nowMs)
      return freshState
    } catch (error: unknown) {
      return this.readStateAfterFailure(userId, nowMs, error)
    }
  }

  private readStateAfterFailure(userId: string, nowMs: number, error: unknown): UserDnsState | null {
    const staleState = this.stateCache.readStale(userId, nowMs)
    if (staleState) {
      logDnsError('dns rules load failed; using stale cache', error)
      return staleState
    }
    logDnsError('dns rules load failed; failing open', error)
    recordDnsMetric('DnsFailOpen', 'dns rules unavailable and no usable cache; query allowed')
    return null
  }
}
