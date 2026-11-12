import { describe, expect, it } from 'vitest'
import { generateTemporaryPassword } from '../generateTemporaryPassword.ts'
import { readAdminSeedSettings } from '../readAdminSeedSettings.ts'

describe('readAdminSeedSettings', () => {
  it('requires the service role key', () => {
    expect(() => readAdminSeedSettings({})).toThrow(/SUPABASE_SERVICE_ROLE_KEY/)
  })

  it('applies local defaults and normalizes the email', () => {
    expect(readAdminSeedSettings({ SUPABASE_SERVICE_ROLE_KEY: 'key', ADMIN_EMAIL: ' Boss@Example.com ' })).toEqual({
      supabaseUrl: 'http://127.0.0.1:54321',
      serviceRoleKey: 'key',
      adminEmail: 'boss@example.com',
      adminPassword: null,
      adminDisplayName: 'Administrador',
    })
  })

  it('removes trailing slashes from the Supabase URL', () => {
    const settings = readAdminSeedSettings({ SUPABASE_SERVICE_ROLE_KEY: 'key', SUPABASE_URL: 'https://x.supabase.co//' })
    expect(settings.supabaseUrl).toBe('https://x.supabase.co')
  })
})

describe('generateTemporaryPassword', () => {
  it('produces different passwords with enough length and no look-alike characters', () => {
    const passwords = new Set(Array.from({ length: 50 }, generateTemporaryPassword))
    expect(passwords.size).toBe(50)
    for (const password of passwords) {
      expect(password).toMatch(/^[A-HJ-NP-Za-km-z2-9]{20}$/)
    }
  })
})
