export type AdminSeedSettings = {
  readonly supabaseUrl: string
  readonly serviceRoleKey: string
  readonly adminEmail: string
  readonly adminPassword: string | null
  readonly adminDisplayName: string
}

const DEFAULT_SUPABASE_URL = 'http://127.0.0.1:54321'
const DEFAULT_ADMIN_EMAIL = 'admin@block-apps.local'
const DEFAULT_ADMIN_DISPLAY_NAME = 'Administrador'
const MIN_CHOSEN_PASSWORD_LENGTH = 12

export function readAdminSeedSettings(environment: Record<string, string | undefined>): AdminSeedSettings {
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to create the initial admin')
  }

  const chosenPassword = environment.ADMIN_PASSWORD
  if (chosenPassword && chosenPassword.length < MIN_CHOSEN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must have at least ${MIN_CHOSEN_PASSWORD_LENGTH} characters`)
  }

  return {
    supabaseUrl: (environment.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, ''),
    serviceRoleKey,
    adminEmail: (environment.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
    adminPassword: chosenPassword || null,
    adminDisplayName: environment.ADMIN_DISPLAY_NAME || DEFAULT_ADMIN_DISPLAY_NAME,
  }
}
