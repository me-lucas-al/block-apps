import { describe, expect, it } from 'vitest'
import type { AdminAccountGateway, NewAdminAccount } from '../AdminAccountGateway.ts'
import { createInitialAdmin } from '../createInitialAdmin.ts'
import type { AdminSeedSettings } from '../readAdminSeedSettings.ts'

const SETTINGS: AdminSeedSettings = {
  supabaseUrl: 'http://127.0.0.1:54321',
  serviceRoleKey: 'service-key',
  adminEmail: 'admin@example.com',
  adminPassword: null,
  adminDisplayName: 'Administrador',
}

class RecordingGateway implements AdminAccountGateway {
  createdAccounts: NewAdminAccount[] = []
  promotedUserIds: string[] = []
  deletedUserIds: string[] = []
  failOnPromotion = false

  async createAuthUser(account: NewAdminAccount): Promise<string> {
    this.createdAccounts.push(account)
    return 'user-1'
  }

  async promoteProfileToAdmin(userId: string): Promise<void> {
    if (this.failOnPromotion) throw new Error('profile missing')
    this.promotedUserIds.push(userId)
  }

  async deleteAuthUser(userId: string): Promise<void> {
    this.deletedUserIds.push(userId)
  }
}

describe('createInitialAdmin', () => {
  it('creates the account with a generated temporary password and promotes it', async () => {
    const gateway = new RecordingGateway()
    const createdAdmin = await createInitialAdmin(SETTINGS, gateway)
    expect(createdAdmin).toMatchObject({ userId: 'user-1', email: 'admin@example.com', passwordWasGenerated: true })
    expect(createdAdmin.temporaryPassword).toHaveLength(20)
    expect(gateway.createdAccounts[0]?.password).toBe(createdAdmin.temporaryPassword)
    expect(gateway.promotedUserIds).toEqual(['user-1'])
  })

  it('uses the password provided by the operator instead of generating one', async () => {
    const gateway = new RecordingGateway()
    const createdAdmin = await createInitialAdmin({ ...SETTINGS, adminPassword: 'chosen-password' }, gateway)
    expect(createdAdmin).toMatchObject({ temporaryPassword: 'chosen-password', passwordWasGenerated: false })
  })

  it('removes the auth user when promotion fails so no half-created admin is left', async () => {
    const gateway = new RecordingGateway()
    gateway.failOnPromotion = true
    await expect(createInitialAdmin(SETTINGS, gateway)).rejects.toThrow('profile missing')
    expect(gateway.deletedUserIds).toEqual(['user-1'])
  })
})
