import { describeApiFailure, type NewBlockRule } from '@block-apps/api'
import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import { useCallback, useEffect, useState } from 'react'
import { useServices } from '../../services/ServicesContext'

function keepAppAndKeywordRules(rules: BlockRule[]): BlockRule[] {
  return rules.filter((rule) => rule.targetType === 'app' || rule.targetType === 'keyword')
}

export function useBlockRules() {
  const { ruleRepository, pendingRuleChanges, rulesSync } = useServices()
  const [rules, setRules] = useState<BlockRule[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingRuleChange[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    await pendingRuleChanges.applyDueChanges().catch(() => undefined)
    const allRules = await ruleRepository.list()
    setRules(keepAppAndKeywordRules(allRules))
    setPendingChanges(await pendingRuleChanges.listPendingChanges())
    rulesSync.push(allRules)
  }, [ruleRepository, pendingRuleChanges, rulesSync])

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

  return {
    rules,
    pendingChanges,
    error,
    create: (rule: NewBlockRule) => runAndReloadRules(() => ruleRepository.create(rule)),
    requestRemoval: (ruleId: string) =>
      runAndReloadRules(() => pendingRuleChanges.requestRemoval(ruleId)).catch(() => undefined),
    cancelChange: (ruleId: string) =>
      runAndReloadRules(() => pendingRuleChanges.cancelPendingChange(ruleId)).catch(
        () => undefined,
      ),
  }
}
