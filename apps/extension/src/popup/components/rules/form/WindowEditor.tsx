import type { TimeWindow } from '@block-apps/core'
import { WindowRow } from './WindowRow'

const DEFAULT_WINDOW: TimeWindow = {
  days: [1, 2, 3, 4, 5],
  start: '18:00',
  end: '20:00',
}

type WindowEditorProps = {
  windows: readonly TimeWindow[]
  onChange: (windows: TimeWindow[]) => void
}

export function WindowEditor({ windows, onChange }: WindowEditorProps) {
  const replaceAt = (index: number, window: TimeWindow) =>
    onChange(windows.map((current, i) => (i === index ? window : current)))

  const removeAt = (index: number) =>
    onChange(windows.filter((_, i) => i !== index))

  return (
    <div className="stack">
      <p className="hint">Horários em que o acesso é permitido:</p>
      {windows.map((window, index) => (
        <WindowRow
          key={index}
          window={window}
          onChange={(updated) => replaceAt(index, updated)}
          onRemove={() => removeAt(index)}
        />
      ))}
      <button type="button" className="secondary"
        onClick={() => onChange([...windows, DEFAULT_WINDOW])}>
        Adicionar horário
      </button>
    </div>
  )
}
