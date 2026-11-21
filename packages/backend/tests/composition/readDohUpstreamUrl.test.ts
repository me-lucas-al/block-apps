import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_DOH_UPSTREAM_URL,
  readDohUpstreamUrl,
} from '../../src/composition/doh/readDohUpstreamUrl'

describe('readDohUpstreamUrl', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  it('defaults to Cloudflare 1.1.1.1 when the variable is missing or blank', () => {
    expect(readDohUpstreamUrl({})).toBe(DEFAULT_DOH_UPSTREAM_URL)
    expect(readDohUpstreamUrl({ DNS_UPSTREAM_URL: '   ' })).toBe(DEFAULT_DOH_UPSTREAM_URL)
  })

  it('accepts an https URL', () => {
    expect(readDohUpstreamUrl({ DNS_UPSTREAM_URL: ' https://dns.google/dns-query ' })).toBe(
      'https://dns.google/dns-query',
    )
  })

  it.each(['http://dns.google/dns-query', 'ftp://dns.google', 'dns.google/dns-query', 'not a url'])(
    'fails fast for %s',
    (invalidUrl) => {
      expect(() => readDohUpstreamUrl({ DNS_UPSTREAM_URL: invalidUrl })).toThrow('DNS_UPSTREAM_URL')
    },
  )

  it('refuses credentials in the URL and never logs the configured value', () => {
    const secretUrl = 'https://user:hunter2@dns.example.test/dns-query'

    expect(() => readDohUpstreamUrl({ DNS_UPSTREAM_URL: secretUrl })).toThrow('credentials')
    const loggedLines = vi.mocked(console.error).mock.calls.map((call) => String(call[0]))
    expect(loggedLines.join('')).not.toContain('hunter2')
  })
})
