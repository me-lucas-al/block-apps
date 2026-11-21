import { readBoundedBytes } from '../../domain/streams/readBoundedBytes'
import type { DohUpstream } from '../contracts/DohUpstream'
import { assertUpstreamAnswersQuery } from './assertUpstreamAnswersQuery'

export const DEFAULT_UPSTREAM_TIMEOUT_MS = 2_000
export const MAX_UPSTREAM_RESPONSE_BYTES = 4_096

export class FetchDohUpstream implements DohUpstream {
  constructor(
    private readonly upstreamUrl: string,
    private readonly timeoutMs: number = DEFAULT_UPSTREAM_TIMEOUT_MS,
    private readonly fetchFunction: typeof fetch = fetch,
    private readonly maxResponseBytes: number = MAX_UPSTREAM_RESPONSE_BYTES,
  ) {}

  async forwardQuery(wireQuery: Uint8Array): Promise<Uint8Array> {
    const response = await this.fetchFunction(this.upstreamUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/dns-message',
        accept: 'application/dns-message',
      },
      body: wireQuery,
      redirect: 'error',
      signal: AbortSignal.timeout(this.timeoutMs),
    })
    if (!response.ok) throw new Error(`upstream returned status ${response.status}`)
    const wireResponse = await readBoundedBytes(response.body, this.maxResponseBytes)
    if (!wireResponse) throw new Error('upstream response exceeds the size limit')
    assertUpstreamAnswersQuery(wireQuery, wireResponse)
    return wireResponse
  }
}
