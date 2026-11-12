import {
  SupabaseAdminAccountGateway,
  createInitialAdmin,
} from '@block-apps/admin-seed'
import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import type { LocalStackSettings } from './readLocalStackSettings.ts'

export type SignedInAccount = {
  readonly email: string
  readonly password: string
  readonly userId: string
  readonly client: SupabaseClient
}

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.local`
}

export function createClientWithoutSession(settings: LocalStackSettings): SupabaseClient {
  return createClient(settings.apiUrl, settings.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function signIn(
  settings: LocalStackSettings,
  email: string,
  password: string,
): Promise<SignedInAccount> {
  const client = createClientWithoutSession(settings)
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data.user) throw new Error(`could not sign in ${email}: ${error?.message}`)
  return { email, password, userId: data.user.id, client }
}

export async function createSignedInAdmin(settings: LocalStackSettings): Promise<SignedInAccount> {
  const email = uniqueEmail('admin')
  const gateway = new SupabaseAdminAccountGateway(settings.apiUrl, settings.serviceRoleKey)
  const createdAdmin = await createInitialAdmin(
    {
      supabaseUrl: settings.apiUrl,
      serviceRoleKey: settings.serviceRoleKey,
      adminEmail: email,
      adminPassword: 'e2e-temporary-password',
      adminDisplayName: 'E2E Admin',
    },
    gateway,
  )
  return signIn(settings, email, createdAdmin.temporaryPassword)
}

export async function createSignedInAdminWithPermanentPassword(
  settings: LocalStackSettings,
): Promise<SignedInAccount> {
  const adminWithTemporaryPassword = await createSignedInAdmin(settings)
  const permanentPassword = 'e2e-permanent-password'
  const { error } = await adminWithTemporaryPassword.client.auth.updateUser({
    password: permanentPassword,
  })
  if (error) throw new Error(`could not change the temporary password: ${error.message}`)
  return { ...adminWithTemporaryPassword, password: permanentPassword }
}
