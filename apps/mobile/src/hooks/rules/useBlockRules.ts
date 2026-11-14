import { describeApiFailure, type NewBlockRule } from '@block-apps/api'
import type { BlockRule, PendingRuleChange, TargetType } from '@block-apps/core'
import { useCallback, useEffect, useState } from 'react'
import { useServices } from '../../services/ServicesContext'

function keepListedTypes(rules: BlockRule[], listedTypes: readonly TargetType[]): BlockRule[] {
  return rules.filter((rule) => listedTypes.includes(rule.targetType))
}

export function useBlockRules() {
  const { ruleRepository, pendingRuleChanges, rulesSync, groupSelection, listedTargetTypes } =
    useServices()
  const [rules, setRules] = useState<BlockRule[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingRuleChange[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    await pendingRuleChanges.applyDueChanges().catch(() => undefined)
    const allRules = await ruleRepository.list()
    const currentPendingChanges = await pendingRuleChanges.listPendingChanges()
    setRules(keepListedTypes(allRules, listedTargetTypes))
    setPendingChanges(currentPendingChanges)
    try {
      rulesSync.push(allRules, currentPendingChanges)
    } catch (failure) {
      setError(describeApiFailure(failure))
    }
  }, [ruleRepository, pendingRuleChanges, rulesSync, listedTargetTypes])

  const runAndReloadRules = useCallback(
    async (change: () => Promise<unknown>) => {
      try {
        setError(null)
        await change()
        await reload()
      } catch (failure: unknown) {
        setError(describeApiFailure(failure))
        throw failure
      }
    },
    [reload],
  )

  useEffect(() => {
    const refresh = () =>
      void reload().catch((failure: unknown) => setError(describeApiFailure(failure)))
    refresh()
    return ruleRepository.subscribeToRuleChanges(refresh)
  }, [reload, ruleRepository])

  const cancelPendingChangeAndSelectionRemoval = async (ruleId: string) => {
    await pendingRuleChanges.cancelPendingChange(ruleId)
    groupSelection?.discardPendingRemoval(ruleId)
  }

  const holdSelectionRemoval = async (rule: BlockRule): Promise<boolean> => {
    try {
      const change = await ruleRepository.requestUpdate(rule.id, {
        mode: rule.mode,
        windows: rule.windows,
      })
      groupSelection?.holdPendingRemoval(rule.id, change.effectiveAt)
      await reload()
      return true
    } catch (failure) {
      setError(describeApiFailure(failure))
      return false
    }
  }

  return {
    rules,
    pendingChanges,
    error,
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
