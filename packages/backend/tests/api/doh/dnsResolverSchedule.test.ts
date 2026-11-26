import type { DayOfWeek } from '@block-apps/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { assembleDohResolverApp } from '../../../src/composition/doh/assembleDohResolverApp'
import { buildDnsSettings } from '../../helpers/dns/buildDnsSettings'
import { getDohQuery, readWireResponse } from '../../helpers/dns/doh/dohRequests'
import { RESOLVER_TEST_TOKEN } from '../../helpers/dns/doh/seedDnsProfile'
import { buildDnsQuery, decodeDnsResponse } from '../../helpers/dnsQueryHelpers'
import { InMemoryDnsSettingsStore } from '../../helpers/InMemoryDnsSettingsStore'
import { InMemoryRuleDatabase } from '../../helpers/InMemoryRuleDatabase'

const FRIDAY_NIGHT_ALLOWED_WINDOW = { days: [5 as DayOfWeek], start: '22:00', end: '06:00' }
const PROCESS_TIME_ZONES = ['UTC', 'America/New_York', 'Asia/Tokyo']
const originalProcessTimeZone = process.env['TZ']

async function isBlockedAt(userTimeZone: string, instantIso: string): Promise<boolean> {
  const ruleDatabase = new InMemoryRuleDatabase()
  const dnsStore = new InMemoryDnsSettingsStore()
  await dnsStore.createDnsSettings('user-1', buildDnsSettings(RESOLVER_TEST_TOKEN, userTimeZone))
  await ruleDatabase.insert('user-1', {
    id: 'site~exemplo.com',
    targetType: 'site',
    target: 'exemplo.com',
    mode: 'schedule',
    windows: [FRIDAY_NIGHT_ALLOWED_WINDOW],
  })
  const unblockedReply = buildDnsQuery('exemplo.com', 'A', 1)
  const dnsApp = assembleDohResolverApp(
    dnsStore,
    dnsStore,
    ruleDatabase,
    { forwardQuery: async () => unblockedReply },
    () => new Date(instantIso),
  )
  const reply = await getDohQuery(dnsApp, RESOLVER_TEST_TOKEN, buildDnsQuery('exemplo.com'))
  const decodedReply = decodeDnsResponse(await readWireResponse(reply))
  return decodedReply.answers?.[0]?.type === 'A' && decodedReply.answers[0].data === '0.0.0.0'
}

describe.each(PROCESS_TIME_ZONES)('dns schedule rule end to end (process TZ %s)', (processTimeZone) => {
  beforeEach(() => {
    process.env['TZ'] = processTimeZone
  })
  afterEach(() => {
    if (originalProcessTimeZone === undefined) delete process.env['TZ']
    else process.env['TZ'] = originalProcessTimeZone
  })

  it('blocks outside the allowed window that crosses midnight, in the user time zone', async () => {
    expect(await isBlockedAt('America/Sao_Paulo', '2026-11-21T00:59:00Z')).toBe(true)
    expect(await isBlockedAt('America/Sao_Paulo', '2026-11-21T01:00:00Z')).toBe(false)
    expect(await isBlockedAt('America/Sao_Paulo', '2026-11-21T02:30:00Z')).toBe(false)
    expect(await isBlockedAt('America/Sao_Paulo', '2026-11-21T08:59:00Z')).toBe(false)
    expect(await isBlockedAt('America/Sao_Paulo', '2026-11-21T09:00:00Z')).toBe(true)
  })

  it('blocks a night that did not start on a listed day', async () => {
    expect(await isBlockedAt('America/Sao_Paulo', '2026-11-22T01:30:00Z')).toBe(true)
  })

  it('falls back to UTC for a stored time zone that is not valid', async () => {
    expect(await isBlockedAt('Mars/Phobos', '2026-11-20T23:30:00Z')).toBe(false)
    expect(await isBlockedAt('Mars/Phobos', '2026-11-20T21:59:00Z')).toBe(true)
    expect(await isBlockedAt('Mars/Phobos', '2026-11-21T06:00:00Z')).toBe(true)
  })
})
