import { describe, expect, it } from 'vitest'
import { createAdminScenario } from '../../harness/createAdminScenario.ts'
import { UNKNOWN_USER_ID } from '../../harness/InMemoryUserDirectory.ts'

describe('AdminCallerGuard', () => {
  it('returns the caller when it is an admin', async () => {
    const { adminCallerGuard, admin } = createAdminScenario()
    expect(await adminCallerGuard.requireAdminCaller(admin.id)).toEqual(admin)
  })

  it('rejects a missing caller as unauthenticated', async () => {
    const { adminCallerGuard } = createAdminScenario()
    await expect(adminCallerGuard.requireAdminCaller(null)).rejects.toMatchObject({
      code: 'unauthenticated',
    })
  })

  it('rejects a common user as forbidden', async () => {
    const { adminCallerGuard, commonUser } = createAdminScenario()
    await expect(adminCallerGuard.requireAdminCaller(commonUser.id)).rejects.toMatchObject({
      code: 'forbidden',
    })
  })

  it('rejects a caller that no longer exists as forbidden', async () => {
    const { adminCallerGuard } = createAdminScenario()
    await expect(adminCallerGuard.requireAdminCaller(UNKNOWN_USER_ID)).rejects.toMatchObject({
      code: 'forbidden',
    })
  })

  it('rejects an admin that still has a temporary password', async () => {
    const { adminCallerGuard, userDirectory } = createAdminScenario()
    const adminWithTemporaryPassword = userDirectory.seed({
      email: 'temporary@example.com',
      role: 'admin',
      mustChangePassword: true,
    })
    await expect(
      adminCallerGuard.requireAdminCaller(adminWithTemporaryPassword.id),
    ).rejects.toMatchObject({ code: 'password_change_required' })
  })
})
