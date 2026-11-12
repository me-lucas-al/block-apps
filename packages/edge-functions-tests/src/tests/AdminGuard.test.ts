import { describe, expect, it } from 'vitest'
import { createAdminScenario } from '../harness/createAdminScenario.ts'
import { UNKNOWN_USER_ID } from '../harness/InMemoryUserDirectory.ts'

describe('AdminGuard', () => {
  it('returns the caller when it is an admin', async () => {
    const { adminGuard, admin } = createAdminScenario()
    expect(await adminGuard.requireAdminCaller(admin.id)).toEqual(admin)
  })

  it('rejects a missing caller as unauthenticated', async () => {
    const { adminGuard } = createAdminScenario()
    await expect(adminGuard.requireAdminCaller(null)).rejects.toMatchObject({ code: 'unauthenticated' })
  })

  it('rejects a common user as forbidden', async () => {
    const { adminGuard, commonUser } = createAdminScenario()
    await expect(adminGuard.requireAdminCaller(commonUser.id)).rejects.toMatchObject({ code: 'forbidden' })
  })

  it('rejects a caller that no longer exists as forbidden', async () => {
    const { adminGuard } = createAdminScenario()
    await expect(adminGuard.requireAdminCaller(UNKNOWN_USER_ID)).rejects.toMatchObject({
      code: 'forbidden',
    })
  })

  it('rejects an admin that still has a temporary password', async () => {
    const { adminGuard, userDirectory } = createAdminScenario()
    const adminWithTemporaryPassword = userDirectory.seed({
      email: 'temporary@example.com',
      role: 'admin',
      mustChangePassword: true,
    })
    await expect(
      adminGuard.requireAdminCaller(adminWithTemporaryPassword.id),
    ).rejects.toMatchObject({ code: 'password_change_required' })
  })

  it('finds an existing user and rejects an unknown one', async () => {
    const { adminGuard, commonUser } = createAdminScenario()
    expect(await adminGuard.requireExistingUser(commonUser.id)).toEqual(commonUser)
    await expect(adminGuard.requireExistingUser(UNKNOWN_USER_ID)).rejects.toMatchObject({
      code: 'not_found',
    })
  })
})
