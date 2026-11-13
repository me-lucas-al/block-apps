import { describeApiFailure, type NewBlockRule } from '@block-apps/api'
import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import { useCallback, useEffect, useState } from 'react'
import { RULE_KINDS } from '../components/rules/ruleKinds'
import { useServices } from '../services/ServicesContext'

function onlyBrowserRules(rules: BlockRule[]): BlockRule[] {
  return rules.filter((rule) => RULE_KINDS.some((kind) => kind === rule.targetType))
}

export function useBlockRules() {
  const { ruleRepository, pendingRuleChanges, background } = useServices()
  const [rules, setRules] = useState<BlockRule[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingRuleChange[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    await pendingRuleChanges.applyDueChanges()
    setRules(onlyBrowserRules(await ruleRepository.list()))
    setPendingChanges(await pendingRuleChanges.listPendingChanges())
  }, [ruleRepository, pendingRuleChanges])

  const changeRulesThenReload = useCallback(
    async (change: () => Promise<unknown>) => {
      try {
        setError(null)
        await change()
        background.notifyRulesChanged()
        await reload()
      } catch (failure) {
        setError(describeApiFailure(failure))
      }
    },
    [background, reload],
  )

  useEffect(() => {
    void reload().catch((failure: unknown) => setError(describeApiFailure(failure)))
  }, [reload])

  return {
    rules,
    pendingChanges,
    error,
    create: (rule: NewBlockRule) => changeRulesThenReload(() => ruleRepository.create(rule)),
    requestRemoval: (ruleId: string) =>
      changeRulesThenReload(() => pendingRuleChanges.requestRemoval(ruleId)),
    cancelChange: (changeId: string) =>
      changeRulesThenReload(() => pendingRuleChanges.cancelPendingChange(changeId)),
  }
}
