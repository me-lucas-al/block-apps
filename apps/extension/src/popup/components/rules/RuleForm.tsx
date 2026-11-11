import type { BlockMode, TimeWindow } from '@block-apps/core'
import type { NewBlockRule } from '@block-apps/api'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { WindowEditor } from './WindowEditor'
import { buildSiteRule } from './buildSiteRule'

type RuleFormProps = {
  onSubmit: (rule: NewBlockRule) => Promise<void>
}

export function RuleForm({ onSubmit }: RuleFormProps) {
  const [target, setTarget] = useState('')
  const [mode, setMode] = useState<BlockMode>('always')
  const [windows, setWindows] = useState<TimeWindow[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const result = buildSiteRule({ target, mode, windows })
    if (!result.rule) return setError(result.error)

    setError(null)
    await onSubmit(result.rule)
    setTarget('')
    setWindows([])
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <input placeholder="Site, ex.: youtube.com" value={target}
        onChange={(event) => setTarget(event.target.value)} />
      <select value={mode} onChange={(event) => setMode(event.target.value as BlockMode)}>
        <option value="always">Bloquear sempre</option>
        <option value="schedule">Permitir só em horários</option>
      </select>
      {mode === 'schedule' && <WindowEditor windows={windows} onChange={setWindows} />}
      {error && <p className="error">{error}</p>}
      <button type="submit">Bloquear site</button>
    </form>
  )
}
