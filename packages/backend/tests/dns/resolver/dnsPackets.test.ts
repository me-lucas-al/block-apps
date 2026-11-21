import dnsPacket from 'dns-packet'
import { describe, expect, it } from 'vitest'
import {
  buildBlockedDnsResponse,
  buildServfailDnsResponse,
  decodeDnsQuery,
  readDnsMessageId,
} from '../../../src/dns/resolver/dnsPackets'
import { buildDnsQuery, decodeDnsResponse } from '../../helpers/dnsQueryHelpers'

describe('dnsPackets', () => {
  it('encodes an A blocked response to 0.0.0.0 with TTL 30', () => {
    const query = decodeDnsQuery(buildDnsQuery('exemplo.com', 'A', 42))
    expect(query).not.toBeNull()
    const response = decodeDnsResponse(buildBlockedDnsResponse(query!))

    expect(response.id).toBe(42)
    expect(response.type).toBe('response')
    expect(response.rcode).toBe('NOERROR')
    expect(response.flag_rd).toBe(true)
    expect(response.flag_ra).toBe(true)
    expect(response.answers).toEqual([
      expect.objectContaining({
        type: 'A',
        name: 'exemplo.com',
        ttl: 30,
        data: '0.0.0.0',
      }),
    ])
  })

  it('encodes an AAAA blocked response to :: with TTL 30', () => {
    const query = decodeDnsQuery(buildDnsQuery('exemplo.com', 'AAAA', 77))
    const response = decodeDnsResponse(buildBlockedDnsResponse(query!))

    expect(response.answers).toEqual([
      expect.objectContaining({
        type: 'AAAA',
        name: 'exemplo.com',
        ttl: 30,
        data: '::',
      }),
    ])
  })

  it('returns an empty NOERROR response for HTTPS/UNKNOWN_65 queries on blocked domains', () => {
    const encoded = dnsPacket.encode({
      type: 'query',
      id: 99,
      flags: dnsPacket.RECURSION_DESIRED,
      questions: [{ type: 'UNKNOWN_65' as never, class: 'IN', name: 'exemplo.com' }],
    })
    const query = decodeDnsQuery(new Uint8Array(encoded))
    const response = decodeDnsResponse(buildBlockedDnsResponse(query!))

    expect(response.rcode).toBe('NOERROR')
    expect(response.answers).toEqual([])
  })

  it('encodes SERVFAIL preserving id and questions', () => {
    const query = decodeDnsQuery(buildDnsQuery('outro.com', 'A', 555))
    const response = decodeDnsResponse(buildServfailDnsResponse(query!))

    expect(response.id).toBe(555)
    expect(response.rcode).toBe('SERVFAIL')
    expect(response.answers).toEqual([])
  })

  it('returns null for truncated, non-query or questionless packets', () => {
    expect(decodeDnsQuery(new Uint8Array([1, 2, 3]))).toBeNull()
    const responsePacket = dnsPacket.encode({ type: 'response', id: 1, questions: [] })
    expect(decodeDnsQuery(new Uint8Array(responsePacket))).toBeNull()
    const emptyQuery = dnsPacket.encode({ type: 'query', id: 1, questions: [] })
    expect(decodeDnsQuery(new Uint8Array(emptyQuery))).toBeNull()
  })

  it('returns null for a query that carries more than one question', () => {
    const encoded = dnsPacket.encode({
      type: 'query',
      id: 3,
      flags: dnsPacket.RECURSION_DESIRED,
      questions: [
        { type: 'A', class: 'IN', name: 'permitido.com' },
        { type: 'A', class: 'IN', name: 'exemplo.com' },
      ],
    })
    expect(decodeDnsQuery(new Uint8Array(encoded))).toBeNull()
  })

  it('reads the message id from the first two bytes', () => {
    expect(readDnsMessageId(buildDnsQuery('exemplo.com', 'A', 0x1234))).toBe(0x1234)
  })
})
