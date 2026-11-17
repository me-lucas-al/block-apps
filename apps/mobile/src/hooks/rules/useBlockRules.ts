import type { NewBlockRule } from '@block-apps/api'
import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import { useCallback, useEffect, useState } from 'react'
import { describeAppFailure } from '../../errors/describeAppFailure'
import { keepListedTypes } from '../../rules/keepListedTypes'
import { useServices } from '../../services/ServicesContext'

export function useBlockRules() {
  const {
    ruleRepository,
    pendingRuleChanges,
    rulesSync,
    groupSelection,
    listedTargetTypes,
    userSession,
    selectionRemovalHolder,
  } = useServices()
  const [rules, setRules] = useState<BlockRule[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingRuleChange[]>([])
  const [error, setError] = useState<string | null>(null)
  const [appliedVersion, setAppliedVersion] = useState(0)

  const reload = useCallback(async () => {
    await pendingRuleChanges.applyDueChanges().catch(() => undefined)
    const allRules = await ruleRepository.list()
    const currentPendingChanges = await pendingRuleChanges.listPendingChanges()
    setRules(keepListedTypes(allRules, listedTargetTypes))
    setPendingChanges(currentPendingChanges)
    try {
      const accountId = await userSession.currentUserId()
      if (accountId) await rulesSync.push(allRules, currentPendingChanges, accountId)
    } catch (failure) {
      setError(describeAppFailure(failure))
    }
    setAppliedVersion((version) => version + 1)
  }, [ruleRepository, pendingRuleChanges, rulesSync, listedTargetTypes, userSession])

  const runAndReloadRules = useCallback(
    async (change: () => Promise<unknown>) => {
      try {
        setError(null)
        await change()
        await reload()
      } catch (failure: unknown) {
        setError(describeAppFailure(failure))
        throw failure
      }
    },
    [reload],
  )

  useEffect(() => {
    const refresh = () =>
      void reload().catch((failure: unknown) => setError(describeAppFailure(failure)))
    refresh()
    return ruleRepository.subscribeToRuleChanges(refresh)
  }, [reload, ruleRepository])

  const cancelPendingChangeAndSelectionRemoval = async (ruleId: string) => {
    await pendingRuleChanges.cancelPendingChange(ruleId)
    groupSelection?.discardPendingRemoval(ruleId)
  }

  const keepOrCancelHold = async (ruleId: string, effectiveAt: string) => {
    try {
      await groupSelection?.holdPendingRemoval(ruleId, effectiveAt)
    } catch (failure) {
      await pendingRuleChanges.cancelPendingChange(ruleId).catch(() => undefined)
      throw failure
    }
  }

  const holdSelectionRemoval = async (rule: BlockRule): Promise<boolean> => {
    try {
      const change = await selectionRemovalHolder.holdRemovalOf(rule)
      await keepOrCancelHold(rule.id, change.effectiveAt)
      await reload()
      return true
    } catch (failure) {
      setError(describeAppFailure(failure))
      return false
    }
  }

  return {
    rules,
    pendingChanges,
    error,
    appliedVersion,
    create: (rule: NewBlockRule) => runAndReloadRules(() => ruleRepository.create(rule)),
    requestRemoval: (ruleId: string) =>
      runAndReloadRules(() => pendingRuleChanges.requestRemoval(ruleId)).catch(() => undefined),
    cancelChange: (ruleId: string) =>
      runAndReloadRules(() => cancelPendingChangeAndSelectionRemoval(ruleId)).catch(
        () => undefined,
      ),
    holdSelectionRemovalUntilCooldownEnds: holdSelectionRemoval,
  }
}
