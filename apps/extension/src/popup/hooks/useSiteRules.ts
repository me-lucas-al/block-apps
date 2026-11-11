import type { NewBlockRule } from '@block-apps/api'
import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import { useCallback, useEffect, useState } from 'react'
import { useServices } from '../services/ServicesContext'

function onlySites(rules: BlockRule[]): BlockRule[] {
  return rules.filter((rule) => rule.targetType === 'site')
}

function messageOf(failure: unknown): string {
  return failure instanceof Error ? failure.message : 'Erro inesperado'
}

export function useSiteRules() {
  const { ruleRepository, background } = useServices()
  const [rules, setRules] = useState<BlockRule[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingRuleChange[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setRules(onlySites(await ruleRepository.list()))
    setPendingChanges(await ruleRepository.listPendingChanges())
  }, [ruleRepository])

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      try {
        setError(null)
        await action()
        await reload()
        background.notifyRulesChanged()
      } catch (failure) {
        setError(messageOf(failure))
      }
    },
    [background, reload],
  )

  useEffect(() => {
    void reload().catch((failure) => setError(messageOf(failure)))
  }, [reload])

  return {
    rules,
    pendingChanges,
    error,
    create: (rule: NewBlockRule) => run(() => ruleRepository.create(rule)),
    requestRemoval: (ruleId: string) => run(() => ruleRepository.requestRemoval(ruleId)),
    cancelChange: (changeId: string) => run(() => ruleRepository.cancelPendingChange(changeId)),
  }
}
