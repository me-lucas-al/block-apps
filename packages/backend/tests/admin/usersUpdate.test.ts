import { describe, expect, it } from 'vitest'
import { buildAdminBackend } from '../helpers/admin/buildAdminBackend'
import { callAdminApi } from '../helpers/admin/callAdminApi'

describe('update user', () => {
  it('changes display name and cooldown', async () => {
    const backend = buildAdminBackend()
    const reply = await callAdminApi(backend, 'PATCH', '/admin/users/user-1', { displayName: 'Ana Maria', cooldownHours: 72 })
    expect(reply.json).toMatchObject({ displayName: 'Ana Maria', cooldownHours: 72 })
  })

  it('clears the display name', async () => {
    const backend = buildAdminBackend()
    const reply = await callAdminApi(backend, 'PATCH', '/admin/users/user-1', { displayName: '' })
    expect(reply.json).toMatchObject({ displayName: null })
  })

  it('promotes a user, resets the password and signs the user out everywhere', async () => {
    const backend = buildAdminBackend()
    const reply = await callAdminApi(backend, 'PATCH', '/admin/users/user-1', { role: 'admin' })
    expect(reply.json).toMatchObject({ role: 'admin', mustChangePassword: true })
    expect([...(backend.cognito.users.get('user-1')?.groups ?? [])]).toEqual(['admin'])
    expect(backend.cognito.signedOut).toContain('user-1')
  })

  it('demotes another admin while one admin remains', async () => {
    const backend = buildAdminBackend()
    const reply = await callAdminApi(backend, 'PATCH', '/admin/users/admin-2', { role: 'user' })
    expect(reply.json).toMatchObject({ role: 'user' })
  })

  it('resets the password on request', async () => {
    const backend = buildAdminBackend()
    await callAdminApi(backend, 'PATCH', '/admin/users/user-1', { resetPassword: true })
    expect(backend.cognito.users.get('user-1')?.status).toBe('RESET_REQUIRED')
  })

  it('does not let an admin change their own role', async () => {
    const backend = buildAdminBackend()
    const reply = await callAdminApi(backend, 'PATCH', '/admin/users/admin-1', { role: 'user' })
    expect(reply.status).toBe(409)
  })

  it('answers 404 for an unknown user and 400 for an empty change', async () => {
    const backend = buildAdminBackend()
    expect((await callAdminApi(backend, 'PATCH', '/admin/users/ghost', { cooldownHours: 1 })).status).toBe(404)
    expect((await callAdminApi(backend, 'PATCH', '/admin/users/user-1', {})).status).toBe(400)
  })
})
