import type { BlockMode, TimeWindow } from '../../rules/types'
import { parseTimeOfDay } from '../evaluation/parseTimeOfDay'

export type ScheduleError = 'no-windows' | 'no-days' | 'invalid-time' | null

function hasValidTimes(window: TimeWindow): boolean {
  try {
    parseTimeOfDay(window.start)
    parseTimeOfDay(window.end)
    return true
  } catch {
    return false
  }
}

export function validateSchedule(
  mode: BlockMode,
  windows: readonly TimeWindow[],
): ScheduleError {
  if (mode === 'always') return null
  if (windows.length === 0) return 'no-windows'
  if (windows.some((window) => window.days.length === 0)) return 'no-days'
  if (!windows.every(hasValidTimes)) return 'invalid-time'
  return null
}
