import { dnsTokenPartitionKey, userPartitionKey } from '../../keys/partitionKeys'
import { DNS_SORT_KEY, DNS_TOKEN_SORT_KEY } from '../../keys/sortKeys'

export function dnsSettingsKey(userId: string) {
  return { pk: userPartitionKey(userId), sk: DNS_SORT_KEY }
}

export function dnsTokenLookupKey(tokenHash: string) {
  return { pk: dnsTokenPartitionKey(tokenHash), sk: DNS_TOKEN_SORT_KEY }
}
