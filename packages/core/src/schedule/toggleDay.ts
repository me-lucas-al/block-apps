import type { DayOfWeek } from '../rules/types'

export function toggleDay(
  days: readonly DayOfWeek[],
  day: DayOfWeek,
): DayOfWeek[] {
  if (days.includes(day)) return days.filter((current) => current !== day)
  return [...days, day].sort((first, second) => first - second)
}
