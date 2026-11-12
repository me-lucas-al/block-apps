import { callApi, type ApiReply } from './callApi'
import type { TestBackend } from './testBackends'

export const WORKDAY_WINDOW = { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' }

export const SITE_RULE_BODY = { targetType: 'site', target: 'Example.com', mode: 'always' }

export const SITE_RULE_ID = 'site~example.com'

export function postRule(
  backend: TestBackend,
  body: unknown = SITE_RULE_BODY,
  userId = 'user-1',
): Promise<ApiReply> {
  return callApi(backend.app, { method: 'POST', path: '/rules', body, userId })
}

export function listRules(backend: TestBackend, userId = 'user-1'): Promise<ApiReply> {
  return callApi(backend.app, { method: 'GET', path: '/rules', userId })
}

export const UPDATE_BODY = { mode: 'schedule', windows: [WORKDAY_WINDOW] }

export function requestUpdate(
  backend: TestBackend,
  body: unknown = UPDATE_BODY,
  userId = 'user-1',
): Promise<ApiReply> {
  const path = `/rules/${SITE_RULE_ID}/update-requests`
  return callApi(backend.app, { method: 'POST', path, body, userId })
}

export function requestRemoval(backend: TestBackend, userId = 'user-1'): Promise<ApiReply> {
  const path = `/rules/${SITE_RULE_ID}/removal-requests`
  return callApi(backend.app, { method: 'POST', path, userId })
}

export function applyDueChanges(backend: TestBackend, userId = 'user-1'): Promise<ApiReply> {
  return callApi(backend.app, { method: 'POST', path: '/pending-changes/apply-due', userId })
}
