import { hashDnsToken } from '../../../src/dns/token/hashDnsToken'
import type { TestBackend } from '../testBackends'

export async function findOwnerOfToken(backend: TestBackend, token: string): Promise<string | null> {
  const owner = await backend.dnsTokenLookup.findValidatedDnsOwner(hashDnsToken(token))
  return owner?.userId ?? null
}
