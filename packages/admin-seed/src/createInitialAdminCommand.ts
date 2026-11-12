import { SupabaseAdminAccountGateway } from './SupabaseAdminAccountGateway.ts'
import { createInitialAdmin } from './createInitialAdmin.ts'
import { readAdminSeedSettings } from './readAdminSeedSettings.ts'

async function printCreatedAdminOnce(): Promise<void> {
  const settings = readAdminSeedSettings(process.env)
  const adminAccountGateway = new SupabaseAdminAccountGateway(settings.supabaseUrl, settings.serviceRoleKey)
  const createdAdmin = await createInitialAdmin(settings, adminAccountGateway)

  console.log(`Administrador criado em ${settings.supabaseUrl}`)
  console.log(`  e-mail: ${createdAdmin.email}`)
  if (createdAdmin.passwordWasGenerated) {
    console.log(`  senha temporária: ${createdAdmin.temporaryPassword}`)
  }
  console.log('Entre no painel; a troca de senha é exigida no primeiro acesso.')
}

printCreatedAdminOnce().catch((failure: unknown) => {
  console.error(failure instanceof Error ? failure.message : failure)
  process.exitCode = 1
})
