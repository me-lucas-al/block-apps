import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import { vi } from 'vitest'
import type { IosNativeModule } from '../module/IosNativeModule'

export const groupRule: BlockRule = {
  id: 'iosSelection~social',
  targetType: 'iosSelection',
  target: 'social',
  mode: 'always',
  windows: [],
}

export const siteRule: BlockRule = {
  id: 'site~x.com',
  targetType: 'site',
  target: 'x.com',
  mode: 'always',
  windows: [],
}

export const androidRule: BlockRule = {
  id: 'app~com.a',
  targetType: 'app',
  target: 'com.a',
  mode: 'always',
  windows: [],
}

export const pendingUpdate: PendingRuleChange = {
  id: groupRule.id,
  ruleId: groupRule.id,
  kind: 'update',
  mode: 'always',
  windows: [],
  effectiveAt: '2026-11-14T00:00:00.000Z',
}

export function snapshotOf(
  rules: BlockRule[],
  pendingChanges: PendingRuleChange[] = [],
  accountId = 'user-sub-1',
  serverNowIso: string | null = '2026-11-16T12:00:00.000Z',
) {
  return { rules, pendingChanges, accountId, serverNowIso }
}

export function buildNativeModule(overrides: Partial<IosNativeModule> = {}): IosNativeModule {
  return {
    setRules: vi.fn(),
    getAuthorizationStatus: () => 'approved',
    requestScreenTimeAuthorization: vi.fn(async () => 'approved'),
    presentAppSelectionPicker: vi.fn(async () => 'saved'),
    hasSelection: () => true,
    getSelectionStatus: () => 'found',
    holdPendingSelection: vi.fn(),
    discardPendingSelection: vi.fn(),
    hasAcceptedStrictMode: () => false,
    acceptStrictMode: vi.fn(),
    reapplyShields: vi.fn(),
    recordAppOpened: vi.fn(),
    getUnscheduledRuleIds: () => [],
    ...overrides,
  }
}

export const signedInOwner = async (): Promise<string | null> => 'owner-sub'
export const signedOutOwner = async (): Promise<string | null> => null
