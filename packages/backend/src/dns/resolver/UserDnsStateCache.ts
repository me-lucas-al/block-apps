import type { DnsSettingsStore } from '../contracts/DnsSettingsStore'
import type { DnsStateProvider, UserDnsState } from '../contracts/DnsStateProvider'
import type { SiteRuleReader } from '../contracts/SiteRuleReader'
import { hashDnsToken } from '../token/hashDnsToken'
import { logDnsError } from './logDnsError'
import { TtlCache } from './TtlCache'

const TOKEN_CACHE_TTL_MS = 60_000
const RULES_CACHE_TTL_MS = 30_000

export class UserDnsStateCache implements DnsStateProvider {
  private readonly userIdCache = new TtlCache<string>(TOKEN_CACHE_TTL_MS)
  private readonly stateCache = new TtlCache<UserDnsState>(RULES_CACHE_TTL_MS)

  constructor(
    private readonly dnsSettingsStore: DnsSettingsStore,
    private readonly siteRuleReader: SiteRuleReader,
  ) {}

  async findUserId(token: string, nowMs: number): Promise<string | null> {
    const tokenHash = hashDnsToken(token)
    const cached = this.userIdCache.readFresh(tokenHash, nowMs)
    if (cached) return cached
    try {
      const userId = await this.dnsSettingsStore.findUserIdByDnsTokenHash(tokenHash)
      if (userId) this.userIdCache.write(tokenHash, userId, nowMs)
      return userId
    } catch (error: unknown) {
      const stale = this.userIdCache.readStale(tokenHash)
      if (!stale) throw error
      logDnsError('dns token lookup failed; using stale cache', error)
      return stale
    }
  }

  async readUserState(userId: string, nowMs: number): Promise<UserDnsState | null> {
    const cached = this.stateCache.readFresh(userId, nowMs)
    if (cached) return cached
    try {
      const [rules, settings] = await Promise.all([
        this.siteRuleReader.listSiteRulesByUser(userId),
        this.dnsSettingsStore.findDnsSettings(userId),
      ])
      const state: UserDnsState = { rules, timeZone: settings?.timeZone ?? 'UTC' }
      this.stateCache.write(userId, state, nowMs)
      return state
    } catch (error: unknown) {
      logDnsError('dns rules load failed', error)
      return this.stateCache.readStale(userId) ?? null
    }
  }
}
