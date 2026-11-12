import { describe, expect, it, vi } from 'vitest'
import type { HttpAdminUsersGateway } from '@block-apps/api'
import type { AdminUser, CreateUserInput, UpdateUserInput } from '@block-apps/core'
import { HttpAdminUsersAdapter } from '../HttpAdminUsersAdapter'

describe('HttpAdminUsersAdapter', () => {
  const sampleUser: AdminUser = {
    id: 'u-1',
    email: 'admin@test.com',
    displayName: 'Admin User',
    role: 'admin',
    cooldownHours: 1,
    mustChangePassword: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  }

  const mockGateway: HttpAdminUsersGateway = {
    listUsers: vi.fn().mockResolvedValue([sampleUser]),
    createUser: vi.fn().mockResolvedValue(sampleUser),
    updateUser: vi.fn().mockResolvedValue(sampleUser),
    deleteUser: vi.fn().mockResolvedValue(undefined),
  } as unknown as HttpAdminUsersGateway

  it('delegates list to listUsers', async () => {
    const adapter = new HttpAdminUsersAdapter(mockGateway)
    const result = await adapter.list()
    expect(result).toEqual([sampleUser])
    expect(mockGateway.listUsers).toHaveBeenCalled()
  })

  it('delegates create to createUser', async () => {
    const adapter = new HttpAdminUsersAdapter(mockGateway)
    const input: CreateUserInput = {
      email: 'new@test.com',
      displayName: 'New',
      role: 'user',
      cooldownHours: 2,
    }
    const result = await adapter.create(input)
    expect(result).toEqual(sampleUser)
    expect(mockGateway.createUser).toHaveBeenCalledWith(input)
  })

  it('delegates update to updateUser', async () => {
    const adapter = new HttpAdminUsersAdapter(mockGateway)
    const input: UpdateUserInput = { displayName: 'Updated' }
    const result = await adapter.update('u-1', input)
    expect(result).toEqual(sampleUser)
    expect(mockGateway.updateUser).toHaveBeenCalledWith('u-1', input)
  })

  it('delegates remove to deleteUser', async () => {
    const adapter = new HttpAdminUsersAdapter(mockGateway)
    await adapter.remove('u-1')
    expect(mockGateway.deleteUser).toHaveBeenCalledWith('u-1')
  })
})
