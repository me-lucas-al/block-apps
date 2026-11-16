import type { BlockRule } from '@block-apps/core'
import { useCallback, useEffect, useState } from 'react'
import { describeAppFailure } from '../../errors/describeAppFailure'
import type {
  GroupSelectionPort,
  GroupStates,
} from '../../ports/groupselection/GroupSelectionPort'

type GroupAppChoicesDependencies = {
  groupSelection: GroupSelectionPort
  ruleIds: readonly string[]
  holdSelectionRemovalUntilCooldownEnds: (rule: BlockRule) => Promise<boolean>
}

const REMOVAL_HELD_NOTICE =
  'Remover apps do grupo só vale depois do período de espera. Os apps atuais seguem bloqueados.'
const REMOVAL_NOT_SCHEDULED_NOTICE =
  'Não foi possível agendar a remoção. Os apps atuais seguem bloqueados.'
const NOT_AUTHORIZED_NOTICE = 'Autorize o Tempo de Uso antes de escolher os apps.'
const NOT_OWNER_NOTICE = 'Este aparelho está protegido por outra conta. Entre com a conta original.'

export function useGroupAppChoices(dependencies: GroupAppChoicesDependencies) {
  const { groupSelection, ruleIds, holdSelectionRemovalUntilCooldownEnds } = dependencies
  const [notice, setNotice] = useState<string | null>(null)
  const [groupStates, setGroupStates] = useState<GroupStates | null>(null)
  const [choicesVersion, setChoicesVersion] = useState(0)
  const ruleIdsKey = ruleIds.join('|')

  useEffect(() => {
    let isStillMounted = true
    groupSelection
      .loadGroupStates(ruleIdsKey ? ruleIdsKey.split('|') : [])
      .then((states) => isStillMounted && setGroupStates(states))
      .catch((failure: unknown) => isStillMounted && setNotice(describeAppFailure(failure)))
    return () => {
      isStillMounted = false
    }
  }, [groupSelection, ruleIdsKey, choicesVersion])

  const chooseAppsOfRule = useCallback(
    async (rule: BlockRule) => {
      setNotice(null)
      const outcome = await groupSelection.chooseApps(rule.id).catch((failure: unknown) => failure)
      setChoicesVersion((version) => version + 1)
      if (typeof outcome !== 'string') return setNotice(describeAppFailure(outcome))
      if (outcome === 'notAuthorized') return setNotice(NOT_AUTHORIZED_NOTICE)
      if (outcome === 'notOwner') return setNotice(NOT_OWNER_NOTICE)
      if (outcome !== 'removalPending') return
      const removalHeld = await holdSelectionRemovalUntilCooldownEnds(rule)
      if (removalHeld) return setNotice(REMOVAL_HELD_NOTICE)
      groupSelection.discardPendingRemoval(rule.id)
      setNotice(REMOVAL_NOT_SCHEDULED_NOTICE)
    },
    [groupSelection, holdSelectionRemovalUntilCooldownEnds],
  )

  return {
    notice,
    chooseAppsOfRule,
    hasChosenApps: (ruleId: string) => !groupStates || groupStates.chosenRuleIds.includes(ruleId),
    isSelectionUnreadable: (ruleId: string) =>
      groupStates?.unreadableRuleIds.includes(ruleId) ?? false,
    isBlockedForLackOfSlots: (ruleId: string) =>
      groupStates?.unscheduledRuleIds.includes(ruleId) ?? false,
  }
}
