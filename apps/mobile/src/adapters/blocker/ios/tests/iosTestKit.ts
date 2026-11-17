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

export function buildNativeModule(overrides: Partial<IosNativeModule> = {}): IosNativeModule {
  return {
    setRules: vi.fn(),
    getAuthorizationStatus: () => 'approved',
    requestScreenTimeAuthorization: vi.fn(async () => 'approved'),
    presentAppSelectionPicker: vi.fn(async () => 'saved'),
    hasSelection: () => true,
    hasPendingSelectionRemoval: () => false,
    holdPendingSelection: vi.fn(),
    getPendingSelectionHold: () => null,
    commitPendingSelection: vi.fn(),
    discardPendingSelection: vi.fn(),
    reapplyShields: vi.fn(),
    getUnscheduledRuleIds: () => [],
    ...overrides,
  }
}
