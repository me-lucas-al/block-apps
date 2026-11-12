import type { BlockRule } from '@block-apps/core'
import type { NewBlockRule } from '@block-apps/api'
import { useCallback, useEffect, useState } from 'react'
import { useServices } from '../services/ServicesContext'

function onlySites(rules: BlockRule[]): BlockRule[] {
  return rules.filter((rule) => rule.targetType === 'site')
}

export function useSiteRules() {
  const { ruleRepository, background } = useServices()
  const [rules, setRules] = useState<BlockRule[]>([])
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (action: () => Promise<void>) => {
    try {
      setError(null)
      await action()
      background.notifyRulesChanged()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro inesperado')
    }
  }, [background])

  const reload = useCallback(async () => {
    setRules(onlySites(await ruleRepository.list()))
  }, [ruleRepository])

  useEffect(() => {
    void reload().catch((failure: Error) => setError(failure.message))
  }, [reload])

  const create = (rule: NewBlockRule) =>
    run(async () => {
      const created = await ruleRepository.create(rule)
      setRules((current) => [...current, created])
    })

  const remove = (ruleId: string) =>
    run(async () => {
      await ruleRepository.remove(ruleId)
      setRules((current) => current.filter((rule) => rule.id !== ruleId))
    })

  return { rules, error, create, remove }
}
