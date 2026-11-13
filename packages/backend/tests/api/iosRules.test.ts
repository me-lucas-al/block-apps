import { describe, expect, it } from 'vitest'
import { callApi } from '../helpers/callApi'
import { backendFactories } from '../helpers/testBackends'
import { WORKDAY_WINDOW, listRules, postRule } from '../helpers/ruleFixtures'
import { useTestBackend } from '../helpers/useTestBackend'

const SELECTION_BODY = { targetType: 'iosSelection', target: ' Redes Sociais ', mode: 'always' }
const PROTECTION_BODY = { targetType: 'protection', target: 'ios-deny-app-removal', mode: 'always' }

describe.each(backendFactories)('ios rules ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('creates an iosSelection rule with a slug name and stable id', async () => {
    const reply = await postRule(backend(), SELECTION_BODY)
    expect(reply.status).toBe(201)
    expect(reply.json).toEqual({
      id: 'iosSelection~redes-sociais',
      targetType: 'iosSelection',
      target: 'redes-sociais',
      mode: 'always',
      windows: [],
    })
  })

  it('keeps the schedule windows of an iosSelection rule', async () => {
    const body = { ...SELECTION_BODY, mode: 'schedule', windows: [WORKDAY_WINDOW] }
    const reply = await postRule(backend(), body)
    expect(reply.status).toBe(201)
    expect(reply.json).toEqual(expect.objectContaining({ mode: 'schedule', windows: [WORKDAY_WINDOW] }))
  })

  it('creates a protection rule for the known target', async () => {
    const reply = await postRule(backend(), PROTECTION_BODY)
    expect(reply.status).toBe(201)
    expect(reply.json).toEqual(expect.objectContaining({ id: 'protection~ios-deny-app-removal' }))
  })

  it('lists ios rules alongside other rules', async () => {
    await postRule(backend(), SELECTION_BODY)
    await postRule(backend(), PROTECTION_BODY)
    const reply = await listRules(backend())
    expect(reply.json).toEqual([
      expect.objectContaining({ targetType: 'iosSelection' }),
      expect.objectContaining({ targetType: 'protection' }),
    ])
  })

  it('rejects a duplicate iosSelection rule for the same user', async () => {
    await postRule(backend(), SELECTION_BODY)
    const reply = await postRule(backend(), { ...SELECTION_BODY, target: 'redes sociais' })
    expect(reply.status).toBe(409)
  })

  it.each([
    ['empty group name', { targetType: 'iosSelection', target: '', mode: 'always' }],
    ['symbols only group name', { targetType: 'iosSelection', target: '!!!', mode: 'always' }],
    ['group name over 50 characters', { targetType: 'iosSelection', target: 'a'.repeat(51), mode: 'always' }],
    ['unknown protection', { targetType: 'protection', target: 'something-else', mode: 'always' }],
    ['unknown target type', { targetType: 'watch', target: 'x', mode: 'always' }],
  ])('rejects %s', async (_label, body) => {
    const reply = await postRule(backend(), body)
    expect(reply.status).toBe(400)
  })

  it('applies the cooldown to removing an iosSelection rule', async () => {
    await postRule(backend(), SELECTION_BODY)
    const path = '/rules/iosSelection~redes-sociais/removal-requests'
    const reply = await callApi(backend().app, { method: 'POST', path, userId: 'user-1' })
    expect(reply.status).toBeLessThan(300)
    expect((await listRules(backend())).json).toHaveLength(1)
  })
})
