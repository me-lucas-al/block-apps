import type { AdminAccountGateway } from './AdminAccountGateway.ts'
import { generateTemporaryPassword } from './generateTemporaryPassword.ts'
import type { AdminSeedSettings } from './readAdminSeedSettings.ts'

export type CreatedAdmin = {
  readonly userId: string
  readonly email: string
  readonly temporaryPassword: string
  readonly passwordWasGenerated: boolean
}

export async function createInitialAdmin(
  settings: AdminSeedSettings,
  adminAccountGateway: AdminAccountGateway,
): Promise<CreatedAdmin> {
  const passwordWasGenerated = settings.adminPassword === null
  const temporaryPassword = settings.adminPassword ?? generateTemporaryPassword()

  const userId = await adminAccountGateway.createAuthUser({
    email: settings.adminEmail,
    password: temporaryPassword,
    displayName: settings.adminDisplayName,
  })

  try {
    await adminAccountGateway.promoteProfileToAdmin(userId, settings.adminDisplayName)
  } catch (failure) {
    await adminAccountGateway.deleteAuthUser(userId)
    throw failure
  }

  return { userId, email: settings.adminEmail, temporaryPassword, passwordWasGenerated }
}
