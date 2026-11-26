import { parseTimeOfDay } from '../../schedule/evaluation/parseTimeOfDay'
import type { TimeWindow } from '../blockRule'

const MINUTES_PER_DAY = 24 * 60
const DAYS_PER_WEEK = 7

function markMinutes(allowedMinutes: boolean[], day: number, fromMinute: number, toMinute: number): void {
  const dayOffset = (day % DAYS_PER_WEEK) * MINUTES_PER_DAY
  for (let minute = fromMinute; minute < toMinute; minute += 1) {
    allowedMinutes[dayOffset + minute] = true
  }
}

function markWindowOnDay(allowedMinutes: boolean[], day: number, startMinute: number, endMinute: number): void {
  if (startMinute < endMinute) {
    markMinutes(allowedMinutes, day, startMinute, endMinute)
    return
  }
  markMinutes(allowedMinutes, day, startMinute, MINUTES_PER_DAY)
  markMinutes(allowedMinutes, day + 1, 0, endMinute)
}

export function buildAllowedMinutesOfWeek(windows: readonly TimeWindow[]): boolean[] {
  const allowedMinutes: boolean[] = new Array<boolean>(DAYS_PER_WEEK * MINUTES_PER_DAY).fill(false)
  for (const window of windows) {
    const startMinute = parseTimeOfDay(window.start)
    const endMinute = parseTimeOfDay(window.end)
    if (startMinute === endMinute) continue
    for (const day of window.days) markWindowOnDay(allowedMinutes, day, startMinute, endMinute)
  }
  return allowedMinutes
}
