import dnsPacket, { type DecodedPacket, type RecordType } from 'dns-packet'

export type DecodedDnsResponse = DecodedPacket & { readonly rcode?: string }

export function buildDnsQuery(
  name: string,
  type: RecordType = 'A',
  id = 1234,
): Uint8Array {
  const encoded = dnsPacket.encode({
    type: 'query',
    id,
    flags: dnsPacket.RECURSION_DESIRED,
    questions: [{ type, class: 'IN', name }],
  })
  return new Uint8Array(encoded)
}

export function decodeDnsResponse(wireResponse: Uint8Array): DecodedDnsResponse {
  return dnsPacket.decode(Buffer.from(wireResponse)) as DecodedDnsResponse
}
