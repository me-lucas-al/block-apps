import type { BlockMode, TimeWindow } from '@block-apps/core'
import type { NewBlockRule } from '@block-apps/api'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { RULE_KIND_LABELS, type RuleKind } from '../ruleKinds'
import { WindowEditor } from './WindowEditor'
import { buildBlockRule } from './buildBlockRule'
import { ruleErrorMessage } from './ruleErrorMessage'

type RuleFormProps = {
  kind: RuleKind
  onSubmit: (rule: NewBlockRule) => Promise<void>
}

export function RuleForm({ kind, onSubmit }: RuleFormProps) {
  const [target, setTarget] = useState('')
  const [mode, setMode] = useState<BlockMode>('always')
  const [windows, setWindows] = useState<TimeWindow[]>([])
  const [error, setError] = useState<string | null>(null)
  const labels = RULE_KIND_LABELS[kind]

  const submitRuleForm = async (event: FormEvent) => {
    event.preventDefault()
    const blockRuleOutcome = buildBlockRule({ kind, target, mode, windows })
    if (!blockRuleOutcome.rule) return setError(ruleErrorMessage(blockRuleOutcome.error))

    setError(null)
    await onSubmit(blockRuleOutcome.rule)
    setTarget('')
    setWindows([])
  }

  return (
    <form className="stack" onSubmit={submitRuleForm}>
      <input placeholder={labels.placeholder} value={target}
        onChange={(event) => setTarget(event.target.value)} />
      <select value={mode} onChange={(event) => setMode(event.target.value as BlockMode)}>
        <option value="always">Bloquear sempre</option>
        <option value="schedule">Permitir só em horários</option>
      </select>
      {mode === 'schedule' && <WindowEditor windows={windows} onChange={setWindows} />}
      {error && <p className="error">{error}</p>}
      <button type="submit">{labels.submit}</button>
    </form>
  )
}
