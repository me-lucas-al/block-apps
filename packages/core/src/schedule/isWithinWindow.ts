import type { DayOfWeek, TimeWindow } from '../rules/types'
import { parseTimeOfDay } from './parseTimeOfDay'

function previousDay(day: DayOfWeek): DayOfWeek {
  return ((day + 6) % 7) as DayOfWeek
}

export function isWithinWindow(window: TimeWindow, now: Date): boolean {
  const start = parseTimeOfDay(window.start)
  const end = parseTimeOfDay(window.end)
  if (start === end) return false

  const today = now.getDay() as DayOfWeek
  const minuteOfDay = now.getHours() * 60 + now.getMinutes()
  const startsToday = window.days.includes(today)

  if (start < end) {
    return startsToday && minuteOfDay >= start && minuteOfDay < end
  }

  const startedYesterday = window.days.includes(previousDay(today))
  const inEveningPart = startsToday && minuteOfDay >= start
  const inMorningPart = startedYesterday && minuteOfDay < end
  return inEveningPart || inMorningPart
}
