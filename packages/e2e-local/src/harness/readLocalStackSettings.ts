export type LocalStackSettings = {
  readonly apiUrl: string
  readonly anonKey: string
  readonly serviceRoleKey: string
}

export function readLocalStackSettings(
  environment: Record<string, string | undefined>,
): LocalStackSettings | null {
  const apiUrl = environment.E2E_API_URL
  const anonKey = environment.E2E_ANON_KEY
  const serviceRoleKey = environment.E2E_SERVICE_ROLE_KEY
  if (!apiUrl || !anonKey || !serviceRoleKey) return null
  return { apiUrl, anonKey, serviceRoleKey }
}
