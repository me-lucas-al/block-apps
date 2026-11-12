function readJwtRole(apiKey: string): string | null {
  const payload = apiKey.split('.')[1]
  if (!payload) return null
  try {
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { role?: unknown }
    return typeof claims.role === 'string' ? claims.role : null
  } catch {
    return null
  }
}

export function assertPublicApiKey(apiKey: string): void {
  const isSecretKey = apiKey.startsWith('sb_secret_') || readJwtRole(apiKey) === 'service_role'
  if (isSecretKey) {
    throw new Error('A secret Supabase key must never be bundled into the admin app: use the anon key')
  }
}
