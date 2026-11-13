import type { NewBlockRule } from '@block-apps/api'
import type { BlockRule, PendingRuleChange, TargetType } from '@block-apps/core'
import { useCallback, useEffect, useState } from 'react'
import { useServices } from '../../services/ServicesContext'

function keepListedTypes(rules: BlockRule[], listedTypes: readonly TargetType[]): BlockRule[] {
  return rules.filter((rule) => listedTypes.includes(rule.targetType))
}

function messageOf(failure: unknown): string {
  return failure instanceof Error ? failure.message : 'Erro inesperado'
}

export function useAppRules() {
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
      setError(messageOf(failure))
    }
  }, [ruleRepository, pendingRuleChanges, rulesSync, listedTargetTypes])

  const reloadAfter = useCallback(
    async (action: () => Promise<unknown>) => {
      try {
        setError(null)
        await action()
        await reload()
      } catch (failure) {
        setError(messageOf(failure))
        throw failure
      }
    },
    [reload],
  )

  useEffect(() => {
    const refresh = () => void reload().catch((failure: unknown) => setError(messageOf(failure)))
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
      setError(messageOf(failure))
      return false
    }
  }

  return {
    rules,
    pendingChanges,
    error,
    create: (rule: NewBlockRule) => reloadAfter(() => ruleRepository.create(rule)),
    requestRemoval: (ruleId: string) =>
      reloadAfter(() => pendingRuleChanges.requestRemoval(ruleId)).catch(() => undefined),
    cancelChange: (ruleId: string) =>
      reloadAfter(() => cancelPendingChangeAndSelectionRemoval(ruleId)).catch(() => undefined),
    holdSelectionRemovalUntilCooldownEnds: holdSelectionRemoval,
  }
}
