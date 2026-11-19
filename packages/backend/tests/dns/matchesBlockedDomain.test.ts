import type { BlockRule } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import { isDomainBlockedNow } from '../../src/dns/resolver/matchesBlockedDomain'
import { toZonedDate } from '../../src/dns/resolver/toZonedDate'

const alwaysSiteRule: BlockRule = {
  id: 'site~exemplo.com',
  targetType: 'site',
  target: 'exemplo.com',
  mode: 'always',
  windows: [],
}

const keywordRule: BlockRule = {
  id: 'keyword~exemplo.com',
  targetType: 'keyword',
  target: 'exemplo.com',
  mode: 'always',
  windows: [],
}

const scheduledSiteRule: BlockRule = {
  id: 'site~jornal.com',
  targetType: 'site',
  target: 'jornal.com',
  mode: 'schedule',
  windows: [{ days: [4], start: '09:00', end: '18:00' }],
}

describe('matchesBlockedDomain and toZonedDate', () => {
  it('blocks the rule host and any subdomain, ignoring case and trailing dots', () => {
    const now = toZonedDate(new Date('2026-11-19T15:00:00Z'), 'UTC')

    expect(isDomainBlockedNow('exemplo.com', [alwaysSiteRule], now)).toBe(true)
    expect(isDomainBlockedNow('WWW.EXEMPLO.COM.', [alwaysSiteRule], now)).toBe(true)
    expect(isDomainBlockedNow('api.sub.exemplo.com', [alwaysSiteRule], now)).toBe(true)
    expect(isDomainBlockedNow('malexemplo.com', [alwaysSiteRule], now)).toBe(false)
    expect(isDomainBlockedNow('exemplo.com.br', [alwaysSiteRule], now)).toBe(false)
  })

  it('ignores non-site rules', () => {
    const now = toZonedDate(new Date('2026-11-19T15:00:00Z'), 'UTC')
    expect(isDomainBlockedNow('exemplo.com', [keywordRule], now)).toBe(false)
  })

  it('evaluates schedule windows in the user IANA time zone', () => {
    const instant = new Date('2026-11-19T13:00:00Z')
    const saoPauloNow = toZonedDate(instant, 'America/Sao_Paulo')
    const tokyoNow = toZonedDate(instant, 'Asia/Tokyo')

    expect(isDomainBlockedNow('jornal.com', [scheduledSiteRule], saoPauloNow)).toBe(false)
    expect(isDomainBlockedNow('jornal.com', [scheduledSiteRule], tokyoNow)).toBe(true)
  })
})
