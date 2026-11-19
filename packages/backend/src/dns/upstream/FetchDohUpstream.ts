import type { DohUpstream } from '../contracts/DohUpstream'

export const DEFAULT_DOH_UPSTREAM_URL = 'https://1.1.1.1/dns-query'
export const DEFAULT_UPSTREAM_TIMEOUT_MS = 2_000

export function readDohUpstreamUrl(env: NodeJS.ProcessEnv): string {
  return env['DNS_UPSTREAM_URL']?.trim() || DEFAULT_DOH_UPSTREAM_URL
}

export class FetchDohUpstream implements DohUpstream {
  constructor(
    private readonly upstreamUrl: string = DEFAULT_DOH_UPSTREAM_URL,
    private readonly timeoutMs: number = DEFAULT_UPSTREAM_TIMEOUT_MS,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async forwardQuery(wireQuery: Uint8Array): Promise<Uint8Array> {
    const response = await this.fetchFn(this.upstreamUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/dns-message',
        accept: 'application/dns-message',
      },
      body: new Uint8Array(wireQuery),
      signal: AbortSignal.timeout(this.timeoutMs),
    })
    if (!response.ok) throw new Error(`upstream returned status ${response.status}`)
    return new Uint8Array(await response.arrayBuffer())
  }
}
