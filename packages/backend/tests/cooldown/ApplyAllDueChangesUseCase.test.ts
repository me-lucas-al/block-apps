import type { PendingRuleChange } from '@block-apps/core'
import { describe, expect, it, vi } from 'vitest'
import type { DueChangeApplier } from '../../src/cooldown/contracts/DueChangeApplier'
import type { PendingChangeStore } from '../../src/cooldown/contracts/PendingChangeStore'
import { ApplyAllDueChangesUseCase } from '../../src/cooldown/use-cases/ApplyAllDueChangesUseCase'
import { ApplyDueChangesForUserUseCase } from '../../src/cooldown/use-cases/ApplyDueChangesForUserUseCase'
import { DueChangesApplicationError } from '../../src/cooldown/use-cases/DueChangesApplicationError'

const NOW = new Date('2026-01-01T00:00:00.000Z')

const DUE_CHANGE: PendingRuleChange = {
  id: 'change-1',
  ruleId: 'site~example.com',
  kind: 'delete',
  mode: null,
  windows: null,
  effectiveAt: '2025-12-31T00:00:00.000Z',
}

function buildPendingChangeStore(userIds: string[]): PendingChangeStore {
  return {
    listChangesByUser: async () => [],
    findByRuleId: async () => null,
    save: async () => undefined,
    cancel: async () => undefined,
    listDueByUser: async () => [DUE_CHANGE],
    listUserIdsWithDueChanges: async () => userIds,
  }
}

function buildUseCase(userIds: string[], failingUserIds: string[]): ApplyAllDueChangesUseCase {
  const applier: DueChangeApplier = {
    applyDueChange: async (userId) => {
      if (failingUserIds.includes(userId)) throw new Error('write failed')
      return true
    },
  }
  const store = buildPendingChangeStore(userIds)
  const applyForUser = new ApplyDueChangesForUserUseCase(store, applier, () => NOW)
  return new ApplyAllDueChangesUseCase(store, applyForUser, () => NOW)
}

describe('ApplyAllDueChangesUseCase', () => {
  it('returns how many changes were applied when nothing fails', async () => {
    const useCase = buildUseCase(['user-1', 'user-2'], [])
    expect(await useCase.applyAllDueChanges()).toBe(2)
  })

  it('keeps going after a failure and then reports the failed users', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const useCase = buildUseCase(['user-1', 'user-2', 'user-3'], ['user-2'])
    const failure = await useCase.applyAllDueChanges().catch((error: unknown) => error)
    expect(failure).toBeInstanceOf(DueChangesApplicationError)
    expect(failure).toMatchObject({ failedUserIds: ['user-2'], appliedCount: 2 })
  })
})
