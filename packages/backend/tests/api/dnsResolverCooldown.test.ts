import { describe, expect, it, vi } from 'vitest'
import { callApi } from '../helpers/callApi'
import { buildDnsQuery, decodeDnsResponse } from '../helpers/dnsQueryHelpers'
import { postRule, requestRemoval } from '../helpers/ruleFixtures'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

describe.each(backendFactories)('dns doh resolver cooldown ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('keeps blocking while removal cooldown is pending and unblocks once applied', async () => {
    await backend().setCooldownHours('user-1', 24)
    await callApi(backend().app, {
      method: 'POST',
      path: '/dns/profile',
      body: { timeZone: 'UTC' },
    })
    expect((await postRule(backend())).status).toBe(201)
    expect((await requestRemoval(backend())).status).toBe(200)

    const forwardQuery = vi.fn(async (query: Uint8Array) => query)
    const dnsApp = backend().createDnsResolver({ forwardQuery })

    const whilePending = await dnsApp.request('/dns-query/test-token-1', {
      method: 'POST',
      headers: { 'content-type': 'application/dns-message' },
      body: new Uint8Array(buildDnsQuery('example.com', 'A', 21)),
    })
    expect(decodeDnsResponse(new Uint8Array(await whilePending.arrayBuffer())).answers).toHaveLength(1)

    backend().clock.advanceHours(25)
    await backend().applyAllDueChanges()

    const afterCooldown = await dnsApp.request('/dns-query/test-token-1', {
      method: 'POST',
      headers: { 'content-type': 'application/dns-message' },
      body: new Uint8Array(buildDnsQuery('example.com', 'A', 22)),
    })
    expect(afterCooldown.status).toBe(200)
    expect(forwardQuery).toHaveBeenCalledTimes(1)
  })
})
