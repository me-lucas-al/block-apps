import { callApi } from '../callApi'
import type { TestBackend } from '../testBackends'

export function postDnsProfile(backend: TestBackend, timeZone: unknown, userId = 'user-1') {
  return callApi(backend.app, { method: 'POST', path: '/dns/profile', body: { timeZone }, userId })
}

export function postRotateDnsToken(backend: TestBackend, userId = 'user-1') {
  return callApi(backend.app, { method: 'POST', path: '/dns/rotate', userId })
}
