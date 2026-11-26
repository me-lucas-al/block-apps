import type { TestBackend } from '../../testBackends'
import { buildDnsSettings } from '../buildDnsSettings'
import { buildWellFormedDnsToken } from './buildWellFormedDnsToken'

export const RESOLVER_TEST_TOKEN = buildWellFormedDnsToken(1)

export async function seedDnsProfile(
  backend: TestBackend,
  timeZone = 'UTC',
  userId = 'user-1',
  token = RESOLVER_TEST_TOKEN,
): Promise<string> {
  const created = await backend.dnsSettingsStore.createDnsSettings(
    userId,
    buildDnsSettings(token, timeZone),
  )
  if (!created) throw new Error('could not seed the dns profile')
  return token
}
