import { describe, expect, it, vi } from 'vitest'
import { UserDnsStateCache } from '../../src/dns/resolver/UserDnsStateCache'
import { buildDnsSettings } from '../helpers/dns/buildDnsSettings'
import { InMemoryDnsSettingsStore } from '../helpers/InMemoryDnsSettingsStore'
import { InMemoryRuleDatabase } from '../helpers/InMemoryRuleDatabase'

async function seedUserWithSiteRule(token: string) {
  const ruleDatabase = new InMemoryRuleDatabase()
  const dnsStore = new InMemoryDnsSettingsStore()
  await dnsStore.createDnsSettings('user-1', buildDnsSettings(token))
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
  it('caches token lookups for 60s and site rules for 30s', async () => {
    const { ruleDatabase, dnsStore } = await seedUserWithSiteRule('tok-1')
    const ownerLookupSpy = vi.spyOn(dnsStore, 'findValidatedDnsOwner')
    const rulesSpy = vi.fn(async (userId: string) => ruleDatabase.listRulesByUser(userId))
    const cache = new UserDnsStateCache(dnsStore, dnsStore, { listSiteRulesByUser: rulesSpy })

    expect(await cache.findUserId('tok-1', 0)).toBe('user-1')
    expect(await cache.findUserId('tok-1', 59_000)).toBe('user-1')
    expect(ownerLookupSpy).toHaveBeenCalledTimes(1)
    expect(await cache.findUserId('tok-1', 60_000)).toBe('user-1')
    expect(ownerLookupSpy).toHaveBeenCalledTimes(2)

    await cache.readUserState('user-1', 0)
    await cache.readUserState('user-1', 29_000)
    expect(rulesSpy).toHaveBeenCalledTimes(1)
    await cache.readUserState('user-1', 30_000)
    expect(rulesSpy).toHaveBeenCalledTimes(2)
  })

  it('uses stale rules on error and returns null when cold', async () => {
    const { ruleDatabase, dnsStore } = await seedUserWithSiteRule('tok-1')
    let rulesReadFails = false
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warmCache = new UserDnsStateCache(dnsStore, dnsStore, {
      listSiteRulesByUser: async (userId) => {
        if (rulesReadFails) throw new Error('outage')
        return ruleDatabase.listRulesByUser(userId)
      },
    })

    expect((await warmCache.readUserState('user-1', 0))?.rules).toHaveLength(1)

    rulesReadFails = true
    expect((await warmCache.readUserState('user-1', 31_000))?.rules).toHaveLength(1)

    const coldCache = new UserDnsStateCache(dnsStore, dnsStore, {
      listSiteRulesByUser: async () => {
        throw new Error('cold outage')
      },
    })
    expect(await coldCache.readUserState('user-1', 0)).toBeNull()
    consoleSpy.mockRestore()
  })
})
