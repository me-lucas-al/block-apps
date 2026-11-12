import { describe, expect, it } from 'vitest'
import { buildAdminBackend } from '../helpers/admin/buildAdminBackend'
import { callAdminApi } from '../helpers/admin/callAdminApi'

describe('create user', () => {
  it('invites a common user by email with the default cooldown', async () => {
    const backend = buildAdminBackend()
    const reply = await callAdminApi(backend, 'POST', '/admin/users', { email: 'New@Example.com', displayName: 'Bia' })
    expect(reply.status).toBe(201)
    expect(reply.json).toMatchObject({ email: 'new@example.com', displayName: 'Bia', role: 'user', cooldownHours: 24, mustChangePassword: true })
    const created = backend.cognito.users.get('generated-1')
    expect([...(created?.groups ?? [])]).toEqual(['user'])
  })

  it('creates an admin in the admin group with its own cooldown', async () => {
    const backend = buildAdminBackend()
    await callAdminApi(backend, 'POST', '/admin/users', { email: 'boss@example.com', role: 'admin', cooldownHours: 0 })
    expect([...(backend.cognito.users.get('generated-1')?.groups ?? [])]).toEqual(['admin'])
    expect(backend.settings.cooldownHoursByUser.get('generated-1')).toBe(0)
  })

  it('rejects an email that is already registered', async () => {
    const backend = buildAdminBackend()
    const reply = await callAdminApi(backend, 'POST', '/admin/users', { email: 'user1@example.com' })
    expect(reply.status).toBe(409)
  })

  it.each([
    ['invalid email', { email: 'nope' }],
    ['unknown role', { email: 'a@example.com', role: 'owner' }],
    ['cooldown above one week', { email: 'a@example.com', cooldownHours: 169 }],
    ['fractional cooldown', { email: 'a@example.com', cooldownHours: 1.5 }],
    ['long display name', { email: 'a@example.com', displayName: 'x'.repeat(81) }],
  ])('rejects %s', async (_label, body) => {
    const backend = buildAdminBackend()
    expect((await callAdminApi(backend, 'POST', '/admin/users', body)).status).toBe(400)
  })
})
