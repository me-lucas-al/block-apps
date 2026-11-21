import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UserDnsStateCache } from '../../../src/dns/resolver/UserDnsStateCache'
import { buildWellFormedDnsToken } from '../../helpers/dns/doh/buildWellFormedDnsToken'
import { RESOLVER_TEST_TOKEN } from '../../helpers/dns/doh/seedDnsProfile'
import { buildDnsSettings } from '../../helpers/dns/buildDnsSettings'
import { InMemoryDnsSettingsStore } from '../../helpers/InMemoryDnsSettingsStore'
import { InMemoryRuleDatabase } from '../../helpers/InMemoryRuleDatabase'

async function seedUserWithSiteRule() {
  const ruleDatabase = new InMemoryRuleDatabase()
  const dnsStore = new InMemoryDnsSettingsStore()
  await dnsStore.createDnsSettings('user-1', buildDnsSettings(RESOLVER_TEST_TOKEN))
  await ruleDatabase.insert('user-1', {
    id: 'site~exemplo.com',
    targetType: 'site',
    target: 'exemplo.com',
    mode: 'always',
    windows: [],
  })
  return { ruleDatabase, dnsStore }
}

describe('UserDnsStateCache', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  it('caches token lookups for 60s and site rules for 30s', async () => {
    const { ruleDatabase, dnsStore } = await seedUserWithSiteRule()
    const ownerLookupSpy = vi.spyOn(dnsStore, 'findValidatedDnsOwner')
    const listRulesSpy = vi.fn(async (userId: string) => ruleDatabase.listRulesByUser(userId))
    const cache = new UserDnsStateCache(dnsStore, dnsStore, { listSiteRulesByUser: listRulesSpy })

    expect(await cache.findUserId(RESOLVER_TEST_TOKEN, 0)).toBe('user-1')
    expect(await cache.findUserId(RESOLVER_TEST_TOKEN, 59_000)).toBe('user-1')
    expect(ownerLookupSpy).toHaveBeenCalledTimes(1)
    expect(await cache.findUserId(RESOLVER_TEST_TOKEN, 60_000)).toBe('user-1')
    expect(ownerLookupSpy).toHaveBeenCalledTimes(2)

    await cache.readUserState('user-1', 0)
    await cache.readUserState('user-1', 29_000)
    expect(listRulesSpy).toHaveBeenCalledTimes(1)
    await cache.readUserState('user-1', 30_000)
    expect(listRulesSpy).toHaveBeenCalledTimes(2)
  })

  it('remembers an unknown token for 10s so repeated probes skip the store', async () => {
    const { dnsStore } = await seedUserWithSiteRule()
    const ownerLookupSpy = vi.spyOn(dnsStore, 'findValidatedDnsOwner')
    const cache = new UserDnsStateCache(dnsStore, dnsStore, new InMemoryRuleDatabase())
    const unknownToken = buildWellFormedDnsToken(9)

    expect(await cache.findUserId(unknownToken, 0)).toBeNull()
    expect(await cache.findUserId(unknownToken, 9_999)).toBeNull()
    expect(ownerLookupSpy).toHaveBeenCalledTimes(1)
    expect(await cache.findUserId(unknownToken, 10_000)).toBeNull()
    expect(ownerLookupSpy).toHaveBeenCalledTimes(2)
  })

  it('keeps using stale state after a failure only until the maximum stale age', async () => {
    const { ruleDatabase, dnsStore } = await seedUserWithSiteRule()
    let rulesReadFails = false
    const cache = new UserDnsStateCache(dnsStore, dnsStore, {
      listSiteRulesByUser: async (userId) => {
        if (rulesReadFails) throw new Error('outage')
        return ruleDatabase.listRulesByUser(userId)
      },
    })
    expect((await cache.readUserState('user-1', 0))?.rules).toHaveLength(1)

    rulesReadFails = true
    expect((await cache.readUserState('user-1', 31_000))?.rules).toHaveLength(1)
    expect((await cache.readUserState('user-1', 600_000))?.rules).toHaveLength(1)
    expect(await cache.readUserState('user-1', 600_001)).toBeNull()
  })

  it('fails open and records the fail-open metric when cold during an outage', async () => {
    const { dnsStore } = await seedUserWithSiteRule()
    const metricLines = vi.spyOn(console, 'log').mockImplementation(() => {})
    const coldCache = new UserDnsStateCache(dnsStore, dnsStore, {
      listSiteRulesByUser: async () => {
        throw new Error('cold outage')
      },
    })

    expect(await coldCache.readUserState('user-1', 0)).toBeNull()

    const metric = JSON.parse(String(metricLines.mock.calls[0]?.[0])) as Record<string, unknown>
    expect(metric['DnsFailOpen']).toBe(1)
    expect(JSON.stringify(metric)).not.toContain(RESOLVER_TEST_TOKEN)
  })
})
