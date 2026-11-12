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

export function readAdminSeedSettings(environment: Record<string, string | undefined>): AdminSeedSettings {
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to create the initial admin')
  }

  return {
    supabaseUrl: (environment.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, ''),
    serviceRoleKey,
    adminEmail: (environment.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
    adminPassword: environment.ADMIN_PASSWORD || null,
    adminDisplayName: environment.ADMIN_DISPLAY_NAME || DEFAULT_ADMIN_DISPLAY_NAME,
  }
}
