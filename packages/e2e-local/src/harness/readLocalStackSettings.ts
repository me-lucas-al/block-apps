export type LocalStackSettings = {
  readonly apiUrl: string
  readonly anonKey: string
  readonly serviceRoleKey: string
}

const LOOPBACK_HOSTNAMES = new Set(['127.0.0.1', 'localhost', '::1', '[::1]'])

function requireLoopbackUrl(apiUrl: string): void {
  const { hostname } = new URL(apiUrl)
  if (!LOOPBACK_HOSTNAMES.has(hostname)) {
    throw new Error(`refusing to run end-to-end tests against ${hostname}: only the local stack is allowed`)
  }
}

export function readLocalStackSettings(
  environment: Record<string, string | undefined>,
): LocalStackSettings | null {
  const apiUrl = environment.E2E_API_URL
  const anonKey = environment.E2E_ANON_KEY
  const serviceRoleKey = environment.E2E_SERVICE_ROLE_KEY
  if (!apiUrl || !anonKey || !serviceRoleKey) return null
  requireLoopbackUrl(apiUrl)
  return { apiUrl, anonKey, serviceRoleKey }
}
