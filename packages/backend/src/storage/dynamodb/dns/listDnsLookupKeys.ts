import { DNS_SORT_KEY } from '../keys/sortKeys'
import { dnsTokenLookupKey } from './items/dnsKeys'

export const DNS_LOOKUP_ATTRIBUTES = ['tokenHash']

export function listDnsLookupKeys(
  storedEntries: Record<string, unknown>[],
): Record<string, unknown>[] {
  return storedEntries.flatMap((storedEntry) => {
    const tokenHash = storedEntry['tokenHash']
    if (storedEntry['sk'] !== DNS_SORT_KEY || typeof tokenHash !== 'string') return []
    return [dnsTokenLookupKey(tokenHash)]
  })
}
