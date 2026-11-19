import dnsPacket, { type Answer, type Question } from 'dns-packet'

const BLOCKED_TTL_SECONDS = 30
const SERVFAIL_RCODE = 2

export type DecodedDnsQuery = {
  readonly id: number
  readonly flagRd: boolean
  readonly question: Question
  readonly questions: Question[]
}

function buildResponseFlags(flagRd: boolean, rcode: number): number {
  const rd = flagRd ? dnsPacket.RECURSION_DESIRED : 0
  return rd | dnsPacket.RECURSION_AVAILABLE | rcode
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

export function decodeDnsQuery(wireQuery: Uint8Array): DecodedDnsQuery | null {
  if (wireQuery.byteLength < 12) return null
  try {
    const packet = dnsPacket.decode(Buffer.from(wireQuery))
    if (packet.type !== 'query') return null
    const question = packet.questions?.[0]
    if (!question?.name || !packet.questions) return null
    return {
      id: packet.id ?? 0,
      flagRd: packet.flag_rd,
      question,
      questions: packet.questions,
    }
  } catch {
    return null
  }
}

export function buildBlockedDnsResponse(query: DecodedDnsQuery): Uint8Array {
  const encoded = dnsPacket.encode({
    type: 'response',
    id: query.id,
    flags: buildResponseFlags(query.flagRd, 0),
    questions: query.questions,
    answers: buildBlockedAnswers(query.question),
  })
  return new Uint8Array(encoded)
}

export function buildServfailDnsResponse(query: DecodedDnsQuery): Uint8Array {
  const encoded = dnsPacket.encode({
    type: 'response',
    id: query.id,
    flags: buildResponseFlags(query.flagRd, SERVFAIL_RCODE),
    questions: query.questions,
    answers: [],
  })
  return new Uint8Array(encoded)
}
