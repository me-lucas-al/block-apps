import { afterEach, describe, expect, it, vi } from 'vitest'
import { readConfiguredDnsHost } from '../../src/composition/readConfiguredDnsHost'

describe('readConfiguredDnsHost', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([[{}], [{ DNS_HOST: '' }], [{ DNS_HOST: '   ' }]])(
    'returns undefined when the host is missing or blank (%j)',
    (environment) => {
      expect(readConfiguredDnsHost(environment)).toBeUndefined()
    },
  )

  it('returns the trimmed hostname', () => {
    expect(readConfiguredDnsHost({ DNS_HOST: '  dns.example.test \n' })).toBe('dns.example.test')
  })

  it('accepts a single label and hyphenated hostnames', () => {
    expect(readConfiguredDnsHost({ DNS_HOST: 'localhost' })).toBe('localhost')
    expect(readConfiguredDnsHost({ DNS_HOST: 'my-dns.example-site.test' })).toBe('my-dns.example-site.test')
  })

  it.each([
    'https://dns.example.test',
    'http://dns.example.test',
    'dns.example.test/',
    'dns.example.test/dns-query',
    'dns.example.test:443',
    'dns example.test',
    'DNS.Example.test',
    '-dns.example.test',
    'dns.example.test-',
    'dns.example.test?x=1',
    'dns.example.test#frag',
    'user@dns.example.test',
    'dns_example.test',
    'dns.example.test"><x>',
  ])('refuses "%s" and logs a structured message', (invalidHost) => {
    const logError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => readConfiguredDnsHost({ DNS_HOST: invalidHost })).toThrow(
      'DNS_HOST must be a bare lowercase hostname without scheme, port or path',
    )
    expect(JSON.parse(String(logError.mock.calls[0]?.[0])).message).toBe('invalid dns host configuration')
  })
})
