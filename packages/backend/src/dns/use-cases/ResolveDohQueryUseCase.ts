import type { Clock } from '../../domain/time/Clock'
import type { DnsStateProvider, UserDnsState } from '../contracts/DnsStateProvider'
import type { DohUpstream } from '../contracts/DohUpstream'
import {
  buildBlockedDnsResponse,
  buildServfailDnsResponse,
  decodeDnsQuery,
  type DecodedDnsQuery,
} from '../resolver/dnsPackets'
import { logDnsError } from '../resolver/logDnsError'
import { isDomainBlockedNow } from '../resolver/matchesBlockedDomain'
import { recordDnsMetric } from '../resolver/recordDnsMetric'
import { toZonedDate } from '../resolver/toZonedDate'
import { isWellFormedDnsToken } from '../token/dnsTokenFormat'

export type DohResolution =
  | { readonly status: 'ok'; readonly wireResponse: Uint8Array }
  | { readonly status: 'not-found' }
  | { readonly status: 'invalid-query' }

const NOT_FOUND: DohResolution = { status: 'not-found' }
const INVALID_QUERY: DohResolution = { status: 'invalid-query' }
const TOKEN_LOOKUP_FAILED = Symbol('token-lookup-failed')

export class ResolveDohQueryUseCase {
  constructor(
    private readonly stateProvider: DnsStateProvider,
    private readonly upstream: DohUpstream,
    private readonly clock: Clock,
  ) {}

  async resolveDohQuery(token: string, wireQuery: Uint8Array): Promise<DohResolution> {
    if (!isWellFormedDnsToken(token)) return NOT_FOUND
    const query = decodeDnsQuery(wireQuery)
    if (!query) return INVALID_QUERY
    const now = this.clock()
    const userId = await this.findUserIdOrReportFailure(token, now.getTime())
    if (userId === TOKEN_LOOKUP_FAILED) return answerWith(buildServfailDnsResponse(query))
    if (!userId) return NOT_FOUND
    const state = await this.stateProvider.readUserState(userId, now.getTime())
    if (state && this.isBlockedAt(query, state, now)) return answerWith(buildBlockedDnsResponse(query))
    return answerWith(await this.forwardToUpstream(wireQuery, query))
  }

  private isBlockedAt(query: DecodedDnsQuery, state: UserDnsState, instant: Date): boolean {
    const zonedInstant = toZonedDate(instant, state.timeZone)
    return isDomainBlockedNow(query.question.name, state.rules, zonedInstant)
  }

  private async findUserIdOrReportFailure(token: string, nowMs: number) {
    try {
      return await this.stateProvider.findUserId(token, nowMs)
    } catch (error: unknown) {
      logDnsError('dns token lookup failed', error)
      recordDnsMetric('DnsTokenLookupFailure', 'dns token lookup failed; answering SERVFAIL')
      return TOKEN_LOOKUP_FAILED
    }
  }

  private async forwardToUpstream(wireQuery: Uint8Array, query: DecodedDnsQuery): Promise<Uint8Array> {
    try {
      return await this.upstream.forwardQuery(wireQuery)
    } catch (error: unknown) {
      logDnsError('dns upstream failed', error)
      recordDnsMetric('DnsUpstreamFailure', 'dns upstream failed; answering SERVFAIL')
      return buildServfailDnsResponse(query)
    }
  }
}

function answerWith(wireResponse: Uint8Array): DohResolution {
  return { status: 'ok', wireResponse }
}
