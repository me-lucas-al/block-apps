import type { NewBlockRule } from '@block-apps/api'
import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import { useCallback, useEffect, useState } from 'react'
import { useServices } from '../../services/ServicesContext'

function onlyApps(rules: BlockRule[]): BlockRule[] {
  return rules.filter((rule) => rule.targetType === 'app')
}

function messageOf(failure: unknown): string {
  return failure instanceof Error ? failure.message : 'Erro inesperado'
}

export function useAppRules() {
  const { ruleRepository, pendingRuleChanges, rulesSync } = useServices()
  const [rules, setRules] = useState<BlockRule[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingRuleChange[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    await pendingRuleChanges.applyDueChanges().catch(() => undefined)
    const allRules = await ruleRepository.list()
    setRules(onlyApps(allRules))
    setPendingChanges(await pendingRuleChanges.listPendingChanges())
    rulesSync.push(allRules)
  }, [ruleRepository, pendingRuleChanges, rulesSync])

  const run = useCallback(
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

  return {
    rules,
    pendingChanges,
    error,
    create: (rule: NewBlockRule) => run(() => ruleRepository.create(rule)),
    requestRemoval: (ruleId: string) =>
      run(() => pendingRuleChanges.requestRemoval(ruleId)).catch(() => undefined),
    cancelChange: (ruleId: string) =>
      run(() => pendingRuleChanges.cancelPendingChange(ruleId)).catch(() => undefined),
  }
}
