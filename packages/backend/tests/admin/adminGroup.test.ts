import { describe, expect, it } from 'vitest'
import { createAdminApp } from '../../src/http/app/createAdminApp'
import { callApi } from '../helpers/callApi'

describe('admin app', () => {
  const app = createAdminApp('admin')

  it('lets a member of the admin group in', async () => {
    const reply = await callApi(app, { method: 'GET', path: '/admin/me', groups: ['admin'] })
    expect(reply).toEqual({ status: 200, json: { userId: 'user-1' } })
  })

  it('rejects a signed-in user outside the admin group', async () => {
    const reply = await callApi(app, { method: 'GET', path: '/admin/me', groups: ['user'] })
    expect(reply.status).toBe(403)
  })

  it('rejects a user with no group at all', async () => {
    const reply = await callApi(app, { method: 'GET', path: '/admin/me' })
    expect(reply.status).toBe(403)
  })

  it('rejects a request without a signed-in user', async () => {
    const reply = await callApi(app, { method: 'GET', path: '/admin/me', userId: null })
    expect(reply.status).toBe(401)
  })
})
