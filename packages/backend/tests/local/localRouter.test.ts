import { describe, expect, it } from 'vitest'
import { buildDevToken, DEV_ADMIN_ID, DEV_USER_ID } from '../../src/local/devUsers'
import { buildWellFormedDnsToken } from '../helpers/dns/doh/buildWellFormedDnsToken'
import { buildDnsQuery } from '../helpers/dnsQueryHelpers'
import { requestWithDevToken } from '../helpers/local/requestWithDevToken'

const userToken = buildDevToken(DEV_USER_ID, ['user'])
const adminToken = buildDevToken(DEV_ADMIN_ID, ['admin'])

describe('local router', () => {
  it('answers the health check without a token', async () => {
    expect((await requestWithDevToken('/health', null)).status).toBe(200)
  })

  it('rejects rule routes without a token', async () => {
    expect((await requestWithDevToken('/rules', null)).status).toBe(401)
  })

  it('rejects a real-looking JWT, since only development tokens are accepted', async () => {
    expect((await requestWithDevToken('/rules', 'eyJhbGciOi.payload.signature')).status).toBe(401)
  })

  it('lets a development user create a rule', async () => {
    const body = JSON.stringify({ targetType: 'site', target: 'exemplo.com', mode: 'always' })
    expect((await requestWithDevToken('/rules', userToken, { method: 'POST', body })).status).toBe(201)
  })

  it('lets the development admin list users', async () => {
    const reply = await requestWithDevToken('/admin/users', adminToken)
    expect(reply.status).toBe(200)
    expect(await reply.json()).toHaveLength(2)
  })

  it('keeps the development user out of the admin routes', async () => {
    expect((await requestWithDevToken('/admin/users', userToken)).status).toBe(403)
  })

  it('routes /dns-query requests without an auth token', async () => {
    const encodedQuery = Buffer.from(buildDnsQuery('exemplo.com')).toString('base64url')
    const path = `/dns-query/${buildWellFormedDnsToken(7)}?dns=${encodedQuery}`

    expect((await requestWithDevToken(path, null)).status).toBe(404)
  })

  it('refuses a request whose host is not local, which blocks DNS rebinding', async () => {
    const reply = await requestWithDevToken('/health', null, {}, {}, 'http://evil.example.com')
    expect(reply.status).toBe(403)
  })
})
