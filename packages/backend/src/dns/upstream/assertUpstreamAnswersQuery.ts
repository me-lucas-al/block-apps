import { DNS_HEADER_BYTES, readDnsMessageId } from '../resolver/dnsPackets'

export function assertUpstreamAnswersQuery(wireQuery: Uint8Array, wireResponse: Uint8Array): void {
  if (wireResponse.byteLength < DNS_HEADER_BYTES) {
    throw new Error('upstream response is shorter than a DNS header')
  }
  if (readDnsMessageId(wireResponse) !== readDnsMessageId(wireQuery)) {
    throw new Error('upstream response id does not match the query id')
  }
}
