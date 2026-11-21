import { describe, expect, it } from 'vitest'
import { postDnsProfile, postRotateDnsToken } from '../../helpers/dns/dnsRequests'
import { listValidTokens } from '../../helpers/dns/listValidTokens'
import { backendFactories } from '../../helpers/testBackends'
import { useTestBackend } from '../../helpers/useTestBackend'

const OK = 200
const CONFLICT = 409

function listStatuses(replies: { status: number }[]): number[] {
  return replies.map((reply) => reply.status).sort()
}

describe.each(backendFactories)('dns concurrent requests ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('creates a single profile when the same user ensures it twice at once', async () => {
    const replies = await Promise.all([
      postDnsProfile(backend(), 'America/Sao_Paulo'),
      postDnsProfile(backend(), 'America/Sao_Paulo'),
    ])
    expect(listStatuses(replies)).toEqual([OK, OK])
    expect(replies[0]?.json).toEqual(replies[1]?.json)
    const stored = await backend().dnsSettingsStore.findDnsSettings('user-1')
    expect(await listValidTokens(backend(), ['test-token-1', 'test-token-2'])).toEqual([stored?.token])
  })

  it('never reports a time zone different from the stored one when ensures race', async () => {
    const replies = await Promise.all([
      postDnsProfile(backend(), 'America/Sao_Paulo'),
      postDnsProfile(backend(), 'Europe/Lisbon'),
    ])
    expect(listStatuses(replies)).toEqual([OK, OK])
    const stored = await backend().dnsSettingsStore.findDnsSettings('user-1')
    const lastReportedTimeZones = replies.map((reply) => (reply.json as { timeZone: string }).timeZone)
    expect(lastReportedTimeZones).toContain(stored?.timeZone)
  })

  it('keeps one valid token when an ensure and a rotation race', async () => {
    await postDnsProfile(backend(), 'America/Sao_Paulo')
    const [ensureReply, rotationReply] = await Promise.all([
      postDnsProfile(backend(), 'Europe/Lisbon'),
      postRotateDnsToken(backend()),
    ])
    expect([OK, CONFLICT]).toContain(ensureReply.status)
    expect([OK, CONFLICT]).toContain(rotationReply.status)
    expect(ensureReply.status === OK || rotationReply.status === OK).toBe(true)
    const stored = await backend().dnsSettingsStore.findDnsSettings('user-1')
    expect(await listValidTokens(backend(), ['test-token-1', 'test-token-2'])).toEqual([stored?.token])
    if (ensureReply.status === OK) expect(stored?.timeZone).toBe('Europe/Lisbon')
    if (rotationReply.status === OK) expect(stored?.token).toBe('test-token-2')
  })

  it('keeps one valid token when two rotations race', async () => {
    await postDnsProfile(backend(), 'America/Sao_Paulo')
    const replies = await Promise.all([postRotateDnsToken(backend()), postRotateDnsToken(backend())])
    expect(replies.filter((reply) => reply.status === OK).length).toBeGreaterThanOrEqual(1)
    expect(replies.every((reply) => [OK, CONFLICT].includes(reply.status))).toBe(true)
    const stored = await backend().dnsSettingsStore.findDnsSettings('user-1')
    const validTokens = await listValidTokens(backend(), ['test-token-1', 'test-token-2', 'test-token-3'])
    expect(validTokens).toEqual([stored?.token])
  })
})
