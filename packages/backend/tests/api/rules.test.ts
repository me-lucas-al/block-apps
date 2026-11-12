import { describe, expect, it } from 'vitest'
import { buildLambdaBindings } from '../helpers/buildLambdaBindings'
import { callApi } from '../helpers/callApi'
import { backendFactories } from '../helpers/testBackends'
import { listRules, postRule, SITE_RULE_BODY, SITE_RULE_ID, WORKDAY_WINDOW } from '../helpers/ruleFixtures'
import { useTestBackend } from '../helpers/useTestBackend'

describe.each(backendFactories)('rules ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('creates a rule with a normalized target and a stable id', async () => {
    const reply = await postRule(backend())
    expect(reply.status).toBe(201)
    expect(reply.json).toEqual({
      id: SITE_RULE_ID,
      targetType: 'site',
      target: 'example.com',
      mode: 'always',
      windows: [],
    })
  })

  it('stores the windows of a schedule rule', async () => {
    const body = { ...SITE_RULE_BODY, mode: 'schedule', windows: [WORKDAY_WINDOW] }
    await postRule(backend(), body)
    const reply = await listRules(backend())
    expect(reply.json).toEqual([
      { id: SITE_RULE_ID, targetType: 'site', target: 'example.com', mode: 'schedule', windows: [WORKDAY_WINDOW] },
    ])
  })

  it('lists only the rules of the signed-in user', async () => {
    await postRule(backend(), SITE_RULE_BODY, 'user-1')
    await postRule(backend(), { ...SITE_RULE_BODY, target: 'other.com' }, 'user-2')
    const reply = await listRules(backend(), 'user-2')
    expect(reply.json).toEqual([expect.objectContaining({ target: 'other.com' })])
  })

  it('rejects a duplicated rule for the same user', async () => {
    await postRule(backend())
    const reply = await postRule(backend())
    expect(reply.status).toBe(409)
  })

  it('accepts the same target for two different users', async () => {
    await postRule(backend(), SITE_RULE_BODY, 'user-1')
    const reply = await postRule(backend(), SITE_RULE_BODY, 'user-2')
    expect(reply.status).toBe(201)
  })

  it.each([
    ['site target that is not a domain', { ...SITE_RULE_BODY, target: 'not a domain' }],
    ['app target with a slash', { targetType: 'app', target: 'com/bad', mode: 'always' }],
    ['too many windows', { ...SITE_RULE_BODY, mode: 'schedule', windows: Array(51).fill(WORKDAY_WINDOW) }],
    ['unknown target type', { ...SITE_RULE_BODY, targetType: 'keyboard' }],
    ['schedule without windows', { ...SITE_RULE_BODY, mode: 'schedule', windows: [] }],
    ['window with an invalid time', { ...SITE_RULE_BODY, mode: 'schedule', windows: [{ ...WORKDAY_WINDOW, start: '25:00' }] }],
    ['window with an invalid day', { ...SITE_RULE_BODY, mode: 'schedule', windows: [{ ...WORKDAY_WINDOW, days: [7] }] }],
    ['unknown mode', { ...SITE_RULE_BODY, mode: 'sometimes' }],
  ])('rejects %s', async (_label, body) => {
    const reply = await postRule(backend(), body)
    expect(reply.status).toBe(400)
  })

  it('rejects a body that is not JSON', async () => {
    const reply = await backend().app.request(
      '/rules',
      { method: 'POST', body: 'not json' },
      buildLambdaBindings('user-1'),
    )
    expect(reply.status).toBe(400)
  })

  it('requires authentication on rule routes but not on the health check', async () => {
    const withoutUser = await callApi(backend().app, { method: 'GET', path: '/rules', userId: null })
    const health = await callApi(backend().app, { method: 'GET', path: '/health', userId: null })
    expect(withoutUser.status).toBe(401)
    expect(health.status).toBe(200)
  })
})

describe.each(backendFactories)('rule targets ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('reduces a site address to its domain', async () => {
    const reply = await postRule(backend(), { ...SITE_RULE_BODY, target: 'https://www.Example.com/path' })
    expect(reply.json).toMatchObject({ id: SITE_RULE_ID, target: 'example.com' })
  })

  it('treats www and bare domain as the same site', async () => {
    await postRule(backend(), { ...SITE_RULE_BODY, target: 'www.example.com' })
    expect((await postRule(backend())).status).toBe(409)
  })

  it('keeps the case of an app identifier', async () => {
    const body = { targetType: 'app', target: 'com.Example.App', mode: 'always' }
    expect((await postRule(backend(), body)).json).toMatchObject({ id: 'app~com.Example.App' })
  })
})
