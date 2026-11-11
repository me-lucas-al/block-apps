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
  const { ruleRepository, rulesSync } = useServices()
  const [rules, setRules] = useState<BlockRule[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingRuleChange[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      setRules(onlyApps(await ruleRepository.list()))
      setPendingChanges(await ruleRepository.listPendingChanges())
      await rulesSync.sync()
    } catch (failure) {
      setError(messageOf(failure))
    }
  }, [ruleRepository, rulesSync])

  useEffect(() => {
    void reload()
    return ruleRepository.subscribe(() => void reload())
  }, [reload, ruleRepository])

  const create = async (rule: NewBlockRule) => {
    await ruleRepository.create(rule)
    await reload()
  }

  const requestRemoval = async (ruleId: string) => {
    await ruleRepository.requestRemoval(ruleId)
    await reload()
  }

  const cancelChange = async (changeId: string) => {
    await ruleRepository.cancelPendingChange(changeId)
    await reload()
  }

  return { rules, pendingChanges, error, create, requestRemoval, cancelChange }
}
