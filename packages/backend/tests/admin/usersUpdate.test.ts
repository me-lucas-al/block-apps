import { describe, expect, it } from 'vitest'
import { buildAdminBackend } from '../helpers/admin/buildAdminBackend'
import { callAdminApi } from '../helpers/admin/callAdminApi'
import { ADMIN_ONE, ADMIN_TWO, PENDING_USER, UNKNOWN_USER, USER_ONE } from '../helpers/admin/userIds'

const patchUser = (userId: string, body: unknown, backend = buildAdminBackend()) =>
  callAdminApi(backend, 'PATCH', `/admin/users/${userId}`, body)

describe('update user', () => {
  it('changes display name and cooldown', async () => {
    const reply = await patchUser(USER_ONE, { displayName: 'Ana Maria', cooldownHours: 72 })
    expect(reply.json).toMatchObject({ displayName: 'Ana Maria', cooldownHours: 72 })
  })

  it('clears the display name', async () => {
    const reply = await patchUser(USER_ONE, { displayName: '' })
    expect(reply.json).toMatchObject({ displayName: null })
  })

  it('promotes a user, resets the password and signs the user out everywhere', async () => {
    const backend = buildAdminBackend()
    const reply = await patchUser(USER_ONE, { role: 'admin' }, backend)
    expect(reply.json).toMatchObject({ role: 'admin', mustChangePassword: true })
    expect([...(backend.cognito.users.get(USER_ONE)?.groups ?? [])]).toEqual(['admin'])
    expect(backend.cognito.signedOut).toContain(USER_ONE)
  })

  it('leaves the role alone when the password reset fails', async () => {
    const backend = buildAdminBackend()
    backend.cognito.failingCommands.add('AdminResetUserPasswordCommand')
    const reply = await patchUser(USER_ONE, { role: 'admin' }, backend)
    expect(reply.status).toBe(500)
    expect([...(backend.cognito.users.get(USER_ONE)?.groups ?? [])]).toEqual(['user'])
  })

  it('promotes a user who has not set a password yet without a reset', async () => {
    const backend = buildAdminBackend()
    await patchUser(PENDING_USER, { role: 'admin' }, backend)
    expect(backend.cognito.users.get(PENDING_USER)?.status).toBe('FORCE_CHANGE_PASSWORD')
  })

  it('demotes another admin while one admin remains', async () => {
    const reply = await patchUser(ADMIN_TWO, { role: 'user' })
    expect(reply.json).toMatchObject({ role: 'user' })
  })

  it('resets the password on request and refuses it when there is none to reset', async () => {
    const backend = buildAdminBackend()
    await patchUser(USER_ONE, { resetPassword: true }, backend)
    expect(backend.cognito.users.get(USER_ONE)?.status).toBe('RESET_REQUIRED')
    expect((await patchUser(PENDING_USER, { resetPassword: true }, backend)).status).toBe(400)
  })

  it('does not let an admin change their own role', async () => {
    expect((await patchUser(ADMIN_ONE, { role: 'user' })).status).toBe(409)
  })

  it('answers 404 for an unknown user and 400 for bad input', async () => {
    expect((await patchUser(UNKNOWN_USER, { cooldownHours: 1 })).status).toBe(404)
    expect((await patchUser(USER_ONE, {})).status).toBe(400)
    expect((await patchUser('user1@example.com', { cooldownHours: 1 })).status).toBe(400)
  })
})
