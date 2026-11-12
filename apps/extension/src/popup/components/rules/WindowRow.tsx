import type { TimeWindow } from '@block-apps/core'
import { DAY_LABELS, toggleDay } from './dayLabels'

type WindowRowProps = {
  window: TimeWindow
  onChange: (window: TimeWindow) => void
  onRemove: () => void
}

export function WindowRow({ window, onChange, onRemove }: WindowRowProps) {
  return (
    <div className="window">
      <div className="days">
        {DAY_LABELS.map(({ day, label }) => (
          <label key={day}>
            <input
              type="checkbox"
              checked={window.days.includes(day)}
              onChange={() => onChange({ ...window, days: toggleDay(window.days, day) })}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="row">
        <input type="time" value={window.start} required
          onChange={(event) => onChange({ ...window, start: event.target.value })} />
        <span>até</span>
        <input type="time" value={window.end} required
          onChange={(event) => onChange({ ...window, end: event.target.value })} />
        <button type="button" className="secondary" onClick={onRemove}>
          Remover
        </button>
      </div>
    </div>
  )
}
