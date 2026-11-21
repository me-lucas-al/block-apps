import type { Clock } from '../../domain/time/Clock'
import type { DnsStateProvider } from '../contracts/DnsStateProvider'
import type { DohUpstream } from '../contracts/DohUpstream'
import {
  buildBlockedDnsResponse,
  buildServfailDnsResponse,
  decodeDnsQuery,
  type DecodedDnsQuery,
} from '../resolver/dnsPackets'
import { logDnsError } from '../resolver/logDnsError'
import { isDomainBlockedNow } from '../resolver/matchesBlockedDomain'
import { toZonedDate } from '../resolver/toZonedDate'

export type DohResolution =
  | { readonly status: 'ok'; readonly wireResponse: Uint8Array }
  | { readonly status: 'not-found' }
  | { readonly status: 'invalid-query' }

export class ResolveDohQueryUseCase {
  constructor(
    private readonly stateProvider: DnsStateProvider,
    private readonly upstream: DohUpstream,
    private readonly clock: Clock,
  ) {}

  async resolveDohQuery(token: string, wireQuery: Uint8Array | null): Promise<DohResolution> {
    if (!token) return { status: 'not-found' }
    const now = this.clock()
    const userId = await this.stateProvider.findUserId(token, now.getTime())
    if (!userId) return { status: 'not-found' }

    if (!wireQuery) return { status: 'invalid-query' }
    const query = decodeDnsQuery(wireQuery)
    if (!query) return { status: 'invalid-query' }

    const state = await this.stateProvider.readUserState(userId, now.getTime())
    if (state) {
      const zonedNow = toZonedDate(now, state.timeZone)
      if (isDomainBlockedNow(query.question.name, state.rules, zonedNow)) {
        return { status: 'ok', wireResponse: buildBlockedDnsResponse(query) }
      }
    }

    return { status: 'ok', wireResponse: await this.forwardToUpstream(wireQuery, query) }
  }

  private async forwardToUpstream(wireQuery: Uint8Array, query: DecodedDnsQuery): Promise<Uint8Array> {
    try {
      return await this.upstream.forwardQuery(wireQuery)
    } catch (error: unknown) {
      logDnsError('dns upstream failed', error)
      return buildServfailDnsResponse(query)
    }
  }
}
