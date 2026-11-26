import { callApi, type ApiReply } from './callApi'
import { postRule, requestUpdate, SITE_RULE_BODY, WORKDAY_WINDOW } from './ruleFixtures'
import type { TestBackend } from './testBackends'

export const SCHEDULED_SITE_RULE_BODY = {
  ...SITE_RULE_BODY,
  mode: 'schedule',
  windows: [WORKDAY_WINDOW],
}

export const SHORTER_WORKDAY_WINDOW = { ...WORKDAY_WINDOW, start: '10:00', end: '16:00' }

export const LONGER_WORKDAY_WINDOW = { ...WORKDAY_WINDOW, start: '08:00', end: '18:00' }

export const SATURDAY_WINDOW = { days: [6], start: '10:00', end: '12:00' }

export const ALWAYS_BLOCKED_UPDATE = { mode: 'always' }

export function scheduleUpdate(...windows: unknown[]) {
  return { mode: 'schedule', windows }
}

export function postScheduledRule(backend: TestBackend, userId = 'user-1'): Promise<ApiReply> {
  return postRule(backend, SCHEDULED_SITE_RULE_BODY, userId)
}

export function requestScheduleUpdate(backend: TestBackend, ...windows: unknown[]): Promise<ApiReply> {
  return requestUpdate(backend, scheduleUpdate(...windows))
}

export function listPendingChanges(backend: TestBackend, userId = 'user-1'): Promise<ApiReply> {
  return callApi(backend.app, { method: 'GET', path: '/pending-changes', userId })
}
