import { dnsTokenPartitionKey } from '../keys/partitionKeys'
import { DNS_SORT_KEY, DNS_TOKEN_SORT_KEY } from '../keys/sortKeys'

export function listKeysToErase(item: Record<string, unknown>): Record<string, unknown>[] {
  const ownKey = { pk: item['pk'], sk: item['sk'] }
  const tokenHash = item['tokenHash']
  if (item['sk'] !== DNS_SORT_KEY || typeof tokenHash !== 'string') return [ownKey]
  return [ownKey, { pk: dnsTokenPartitionKey(tokenHash), sk: DNS_TOKEN_SORT_KEY }]
}
