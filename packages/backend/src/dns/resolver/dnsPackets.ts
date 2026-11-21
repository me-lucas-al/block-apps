import dnsPacket, { type Answer, type Question } from 'dns-packet'

const BLOCKED_TTL_SECONDS = 30
const SERVFAIL_RCODE = 2
export const DNS_HEADER_BYTES = 12

export type DecodedDnsQuery = {
  readonly id: number
  readonly flagRd: boolean
  readonly question: Question
}

function buildResponseFlags(flagRd: boolean, rcode: number): number {
  const recursionDesired = flagRd ? dnsPacket.RECURSION_DESIRED : 0
  return recursionDesired | dnsPacket.RECURSION_AVAILABLE | rcode
}

function buildBlockedAnswers(question: Question): Answer[] {
  if (question.type === 'A') {
    return [{ type: 'A', class: 'IN', name: question.name, ttl: BLOCKED_TTL_SECONDS, data: '0.0.0.0' }]
  }
  if (question.type === 'AAAA') {
    return [{ type: 'AAAA', class: 'IN', name: question.name, ttl: BLOCKED_TTL_SECONDS, data: '::' }]
  }
  return []
}

function encodeResponse(query: DecodedDnsQuery, rcode: number, answers: Answer[]): Uint8Array {
  const encoded = dnsPacket.encode({
    type: 'response',
    id: query.id,
    flags: buildResponseFlags(query.flagRd, rcode),
    questions: [query.question],
    answers,
  })
  return new Uint8Array(encoded)
}

export function readDnsMessageId(wireMessage: Uint8Array): number {
  return (wireMessage[0] ?? 0) * 256 + (wireMessage[1] ?? 0)
}

export function decodeDnsQuery(wireQuery: Uint8Array): DecodedDnsQuery | null {
  if (wireQuery.byteLength < DNS_HEADER_BYTES) return null
  try {
    const packet = dnsPacket.decode(Buffer.from(wireQuery))
    if (packet.type !== 'query') return null
    const [question] = packet.questions ?? []
    if (packet.questions?.length !== 1 || !question?.name) return null
    return { id: packet.id ?? 0, flagRd: packet.flag_rd, question }
  } catch {
    return null
  }
}

export function buildBlockedDnsResponse(query: DecodedDnsQuery): Uint8Array {
  return encodeResponse(query, 0, buildBlockedAnswers(query.question))
}

export function buildServfailDnsResponse(query: DecodedDnsQuery): Uint8Array {
  return encodeResponse(query, SERVFAIL_RCODE, [])
}
