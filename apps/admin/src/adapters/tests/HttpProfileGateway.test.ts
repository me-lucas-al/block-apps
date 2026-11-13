import { describe, expect, it, vi } from 'vitest'
import type { Authenticator, HttpAdminUsersGateway, UserSession } from '@block-apps/api'
import type { AdminUser } from '@block-apps/core'
import { HttpProfileGateway } from '../HttpProfileGateway'

describe('HttpProfileGateway', () => {
  const payload = {
    sub: 'user-admin',
    email: 'admin@blockapps.com',
    name: 'Admin Name',
    'cognito:groups': ['admin'],
  }
  const sampleToken = `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`

  const mockSession: UserSession = {
    currentUserEmail: vi.fn().mockResolvedValue('admin@blockapps.com'),
    currentIdToken: vi.fn().mockResolvedValue(sampleToken),
    currentAccessToken: vi.fn().mockResolvedValue('acc'),
    watchUserEmail: vi.fn(),
  }

  const sampleAdmin: AdminUser = {
    id: 'user-admin',
    email: 'admin@blockapps.com',
    displayName: 'Admin Name Enriched',
    role: 'admin',
    cooldownHours: 1,
    mustChangePassword: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  }

  const mockAdminUsers: HttpAdminUsersGateway = {
    listUsers: vi.fn().mockResolvedValue([sampleAdmin]),
    updateUser: vi.fn().mockResolvedValue(sampleAdmin),
    createUser: vi.fn(),
    deleteUser: vi.fn(),
  } as unknown as HttpAdminUsersGateway

  const mockAuthenticator: Authenticator = {
    signInWithPassword: vi.fn(),
    beginGoogleSignIn: vi.fn(),
    exchangeOAuthCode: vi.fn(),
    signUpWithPassword: vi.fn(),
    signOut: vi.fn(),
    changePassword: vi.fn().mockResolvedValue(undefined),
  }

  it('loads profile and enriches from admin list', async () => {
    const gateway = new HttpProfileGateway(mockSession, mockAdminUsers, mockAuthenticator)
    const profile = await gateway.loadMyProfile()

    expect(profile).toEqual({
      id: 'user-admin',
      email: 'admin@blockapps.com',
      displayName: 'Admin Name Enriched',
      role: 'admin',
      mustChangePassword: true,
    })
  })

  it('returns null if token missing', async () => {
    const noTokenSession: UserSession = {
      ...mockSession,
      currentIdToken: vi.fn().mockResolvedValue(null),
    }
    const gateway = new HttpProfileGateway(noTokenSession, mockAdminUsers, mockAuthenticator)
    expect(await gateway.loadMyProfile()).toBeNull()
  })

  it('updates display name via admin users gateway', async () => {
    const gateway = new HttpProfileGateway(mockSession, mockAdminUsers, mockAuthenticator)
    await gateway.updateMyDisplayName('New Name')
    expect(mockAdminUsers.updateUser).toHaveBeenCalledWith('user-admin', { displayName: 'New Name' })
  })

  it('delegates change password to authenticator.changePassword', async () => {
    const gateway = new HttpProfileGateway(mockSession, mockAdminUsers, mockAuthenticator)
    await gateway.changePassword('oldpass123', 'newpass123')
    expect(mockAuthenticator.changePassword).toHaveBeenCalledWith('oldpass123', 'newpass123')
  })
})
