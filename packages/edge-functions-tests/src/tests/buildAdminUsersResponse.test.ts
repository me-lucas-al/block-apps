import { beforeEach, describe, expect, it } from 'vitest'
import { buildAdminUsersResponse } from '../../../../supabase/functions/_shared/admin-users/buildAdminUsersResponse.ts'
import type { AdminUser } from '../../../../supabase/functions/_shared/admin-users/model/adminUser.ts'
import { createAdminScenario } from '../harness/createAdminScenario.ts'
import { UNKNOWN_USER_ID } from '../harness/InMemoryUserDirectory.ts'

describe('buildAdminUsersResponse', () => {
  let scenario: ReturnType<typeof createAdminScenario>

  const sendAdminRequest = (body: unknown, callerId: string | null = scenario.admin.id, method = 'POST') =>
    buildAdminUsersResponse({ method, callerId, body }, scenario.useCases)

  beforeEach(() => {
    scenario = createAdminScenario()
  })

  it('only accepts POST', async () => {
    expect((await sendAdminRequest({ action: 'list' }, scenario.admin.id, 'GET')).status).toBe(405)
  })

  it('lists users', async () => {
    const response = await sendAdminRequest({ action: 'list' })
    expect(response.status).toBe(200)
    expect((response.body as { users: unknown[] }).users).toHaveLength(2)
  })

  it('creates a user from validated input', async () => {
    const response = await sendAdminRequest({
      action: 'create',
      user: { email: 'new@example.com', password: 'a-long-password' },
    })
    expect(response.status).toBe(200)
    expect((response.body as { user: AdminUser }).user.email).toBe('new@example.com')
  })

  it('updates and deletes a user', async () => {
    const userId = scenario.commonUser.id
    const updated = await sendAdminRequest({ action: 'update', id: userId, user: { displayName: 'Ana' } })
    expect((updated.body as { user: AdminUser }).user.displayName).toBe('Ana')
    expect((await sendAdminRequest({ action: 'delete', id: userId })).body).toEqual({ ok: true })
  })

  it('answers 400 for invalid input and unknown actions', async () => {
    expect((await sendAdminRequest({ action: 'create', user: { email: 'x' } })).status).toBe(400)
    expect((await sendAdminRequest({ action: 'explode' })).status).toBe(400)
    expect((await sendAdminRequest('nonsense')).status).toBe(400)
    expect((await sendAdminRequest({ action: 'delete' })).status).toBe(400)
    expect((await sendAdminRequest({ action: 'delete', id: 'not-a-uuid' })).status).toBe(400)
  })

  it('answers 401, 403 and 404 for authorization and lookup failures', async () => {
    expect((await sendAdminRequest({ action: 'list' }, null)).status).toBe(401)
    expect((await sendAdminRequest({ action: 'list' }, scenario.commonUser.id)).status).toBe(403)
    expect((await sendAdminRequest({ action: 'delete', id: UNKNOWN_USER_ID })).status).toBe(404)
  })

  it('answers 409 for a duplicated email and for self deletion', async () => {
    const duplicate = await sendAdminRequest({
      action: 'create',
      user: { email: 'user@example.com', password: 'a-long-password' },
    })
    expect(duplicate.status).toBe(409)
    expect((await sendAdminRequest({ action: 'delete', id: scenario.admin.id })).status).toBe(409)
  })

  it('logs unexpected failures on the server side only', async () => {
    const loggedFailures: unknown[] = []
    scenario.userDirectory.list = async () => {
      throw new Error('database password is hunter2')
    }
    const response = await buildAdminUsersResponse(
      { method: 'POST', callerId: scenario.admin.id, body: { action: 'list' } },
      scenario.useCases,
      (failure) => loggedFailures.push(failure),
    )
    expect(loggedFailures).toHaveLength(1)
    expect(JSON.stringify(response.body)).not.toContain('hunter2')
  })

  it('hides unexpected errors behind a generic 500', async () => {
    scenario.userDirectory.list = async () => {
      throw new Error('database password is hunter2')
    }
    const response = await sendAdminRequest({ action: 'list' })
    expect(response.status).toBe(500)
    expect(JSON.stringify(response.body)).not.toContain('hunter2')
  })
})
