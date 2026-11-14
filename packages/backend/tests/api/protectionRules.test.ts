import { describe, expect, it } from 'vitest'
import { callApi } from '../helpers/callApi'
import { postRule, WORKDAY_WINDOW } from '../helpers/ruleFixtures'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

const PROTECTION_BODY = { targetType: 'protection', target: 'ios-deny-app-removal', mode: 'always' }
const UPDATE_PATH = '/rules/protection~ios-deny-app-removal/update-requests'

describe.each(backendFactories)('protection rules stay always on ($name)', (factory) => {
  const backend = useTestBackend(factory)

  function requestUpdate(body: unknown) {
    return callApi(backend().app, { method: 'POST', path: UPDATE_PATH, body })
  }

  it('refuses to create a protection rule that follows a schedule', async () => {
    const body = { ...PROTECTION_BODY, mode: 'schedule', windows: [WORKDAY_WINDOW] }
    expect((await postRule(backend(), body)).status).toBe(400)
  })

  it('refuses to turn a protection rule into a scheduled one', async () => {
    await postRule(backend(), PROTECTION_BODY)
    const reply = await requestUpdate({ mode: 'schedule', windows: [WORKDAY_WINDOW] })
    expect(reply.status).toBe(400)
  })

  it('accepts an update that keeps the protection always on', async () => {
    await postRule(backend(), PROTECTION_BODY)
    expect((await requestUpdate({ mode: 'always' })).status).toBe(200)
  })

  it('still lets other rules follow a schedule', async () => {
    const body = { targetType: 'iosSelection', target: 'redes', mode: 'schedule', windows: [WORKDAY_WINDOW] }
    expect((await postRule(backend(), body)).status).toBe(201)
  })
})
