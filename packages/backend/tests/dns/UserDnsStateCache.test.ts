import { describe, expect, it, vi } from 'vitest'
import { UserDnsStateCache } from '../../src/dns/resolver/UserDnsStateCache'
import { InMemoryRuleDatabase } from '../helpers/InMemoryRuleDatabase'

describe('UserDnsStateCache', () => {
  it('caches token lookups for 60s and site rules for 30s', async () => {
    const database = new InMemoryRuleDatabase()
    await database.createDnsSettings('user-1', {
      token: 'tok-1',
      timeZone: 'UTC',
      createdAt: '2026-11-19T12:00:00.000Z',
    })
    const tokenSpy = vi.spyOn(database, 'findUserIdByDnsTokenHash')
    const rulesSpy = vi.fn(async (userId: string) => database.listRulesByUser(userId))
    const cache = new UserDnsStateCache(database, { listSiteRulesByUser: rulesSpy })

    expect(await cache.findUserId('tok-1', 0)).toBe('user-1')
    expect(await cache.findUserId('tok-1', 59_000)).toBe('user-1')
    expect(tokenSpy).toHaveBeenCalledTimes(1)
    expect(await cache.findUserId('tok-1', 60_000)).toBe('user-1')
    expect(tokenSpy).toHaveBeenCalledTimes(2)

    await cache.readUserState('user-1', 0)
    await cache.readUserState('user-1', 29_000)
    expect(rulesSpy).toHaveBeenCalledTimes(1)
    await cache.readUserState('user-1', 30_000)
    expect(rulesSpy).toHaveBeenCalledTimes(2)
  })

  it('uses stale rules on error and returns null when cold', async () => {
    const database = new InMemoryRuleDatabase()
    await database.createDnsSettings('user-1', {
      token: 'tok-1',
      timeZone: 'UTC',
      createdAt: '2026-11-19T12:00:00.000Z',
    })
    await database.insert('user-1', {
      id: 'site~exemplo.com',
      targetType: 'site',
      target: 'exemplo.com',
      mode: 'always',
      windows: [],
    })
    let shouldFail = false
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warmCache = new UserDnsStateCache(database, {
      listSiteRulesByUser: async (userId) => {
        if (shouldFail) throw new Error('outage')
        return database.listRulesByUser(userId)
      },
    })

    const initial = await warmCache.readUserState('user-1', 0)
    expect(initial?.rules).toHaveLength(1)

    shouldFail = true
    const stale = await warmCache.readUserState('user-1', 31_000)
    expect(stale?.rules).toHaveLength(1)

    const coldCache = new UserDnsStateCache(database, {
      listSiteRulesByUser: async () => {
        throw new Error('cold outage')
      },
    })
    expect(await coldCache.readUserState('user-1', 0)).toBeNull()
    consoleSpy.mockRestore()
  })
})
