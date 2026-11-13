import type { BlockRule } from '@block-apps/core'
import { useCallback, useState } from 'react'
import type { GroupSelectionPort } from '../../ports/groupselection/GroupSelectionPort'

type GroupAppChoicesDependencies = {
  groupSelection: GroupSelectionPort
  holdSelectionRemovalUntilCooldownEnds: (rule: BlockRule) => Promise<unknown>
}

const REMOVAL_HELD_NOTICE =
  'Remover apps do grupo só vale depois do período de espera. Os apps atuais seguem bloqueados.'

export function useGroupAppChoices(dependencies: GroupAppChoicesDependencies) {
  const { groupSelection, holdSelectionRemovalUntilCooldownEnds } = dependencies
  const [notice, setNotice] = useState<string | null>(null)
  const [choicesVersion, setChoicesVersion] = useState(0)

  const chooseAppsOfRule = useCallback(
    async (rule: BlockRule) => {
      setNotice(null)
      const outcome = await groupSelection.chooseApps(rule.id).catch(() => 'cancelled' as const)
      setChoicesVersion((version) => version + 1)
      if (outcome !== 'removalPending') return
      await holdSelectionRemovalUntilCooldownEnds(rule)
      setNotice(REMOVAL_HELD_NOTICE)
    },
    [groupSelection, holdSelectionRemovalUntilCooldownEnds],
  )

  return {
    notice,
    choicesVersion,
    chooseAppsOfRule,
    hasChosenApps: (ruleId: string) => groupSelection.hasChosenApps(ruleId),
    unscheduledRuleIds: groupSelection.listUnscheduledRuleIds(),
  }
}
