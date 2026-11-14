import type { NewBlockRule } from '@block-apps/api'
import type { BlockMode, TimeWindow } from '@block-apps/core'
import { useState } from 'react'
import { messageOf } from '../../errors/messageOf'
import { buildIosGroupRule } from '../../rules/buildIosGroupRule'
import { ruleErrorMessage } from '../../rules/ruleErrorMessage'
import type { GroupSelectionPort } from '../../ports/groupselection/GroupSelectionPort'

type IosGroupRuleFormDependencies = {
  groupSelection: GroupSelectionPort
  createGroupRule: (rule: NewBlockRule) => Promise<void>
  closeForm: () => void
}

export function useIosGroupRuleForm(dependencies: IosGroupRuleFormDependencies) {
  const { groupSelection, createGroupRule, closeForm } = dependencies
  const [groupName, setGroupName] = useState('')
  const [mode, setMode] = useState<BlockMode>('always')
  const [windows, setWindows] = useState<TimeWindow[]>([])
  const [appsChosen, setAppsChosen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buildDraft = () => buildIosGroupRule({ groupName, mode, windows })

  const chooseAppsForGroup = async () => {
    const draft = buildIosGroupRule({ groupName, mode: 'always', windows: [] })
    if (draft.error) return setError(ruleErrorMessage(draft.error))
    try {
      setError(null)
      const outcome = await groupSelection.chooseApps(draft.ruleId)
      if (outcome === 'removalPending') groupSelection.discardPendingRemoval(draft.ruleId)
      if (outcome === 'notAuthorized') setError(ruleErrorMessage('not-authorized'))
      setAppsChosen(groupSelection.hasChosenApps(draft.ruleId))
    } catch (failure) {
      setError(messageOf(failure))
    }
  }

  const submitGroupRule = async () => {
    const draft = buildDraft()
    if (draft.error) return setError(ruleErrorMessage(draft.error))
    if (!groupSelection.hasChosenApps(draft.ruleId)) return setError(ruleErrorMessage('no-apps'))
    try {
      setError(null)
      await createGroupRule(draft.rule)
      closeForm()
    } catch (failure) {
      setError(messageOf(failure))
    }
  }

  return {
    groupName,
    mode,
    windows,
    appsChosen,
    error,
    changeGroupName: (name: string) => {
      setGroupName(name)
      setAppsChosen(false)
    },
    setMode,
    setWindows,
    chooseAppsForGroup,
    submitGroupRule,
  }
}
