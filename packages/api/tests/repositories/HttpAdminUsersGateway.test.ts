import { describe, expect, it, vi } from 'vitest'
import type { AdminUser } from '@block-apps/core'
import { HttpApiClient } from '../../src/http/client/HttpApiClient'
import { HttpAdminUsersGateway } from '../../src/repositories/http/admin-users/HttpAdminUsersGateway'

describe('HttpAdminUsersGateway', () => {
  it('lists users via GET /admin/users', async () => {
    const users: AdminUser[] = [
      {
        id: 'u1',
        email: 'u1@test.com',
        displayName: 'User 1',
        role: 'user',
        cooldownHours: 24,
        mustChangePassword: false,
        createdAt: '2026-11-12T10:00:00Z',
      },
    ]
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(users), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const gateway = new HttpAdminUsersGateway(client)

    const result = await gateway.listUsers()
    expect(result).toEqual(users)
    expect(fetchMock).toHaveBeenCalledWith('https://api.test/admin/users', expect.objectContaining({ method: 'GET' }))
  })

  it('creates user via POST /admin/users', async () => {
    const created: AdminUser = {
      id: 'u2',
      email: 'u2@test.com',
      displayName: 'User 2',
      role: 'admin',
      cooldownHours: 0,
      mustChangePassword: true,
      createdAt: '2026-11-12T10:00:00Z',
    }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(created), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const gateway = new HttpAdminUsersGateway(client)

    const result = await gateway.createUser({
      email: 'u2@test.com',
      displayName: 'User 2',
      role: 'admin',
      cooldownHours: 0,
    })
    expect(result).toEqual(created)
  })

  it('deletes user via DELETE /admin/users/:userId', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const gateway = new HttpAdminUsersGateway(client)

    await gateway.deleteUser('u2')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/admin/users/u2',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
