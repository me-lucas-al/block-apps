import type { DayOfWeek } from '@block-apps/core'

export const DAY_LABELS: ReadonlyArray<{ day: DayOfWeek; label: string }> = [
  { day: 0, label: 'Dom' },
  { day: 1, label: 'Seg' },
  { day: 2, label: 'Ter' },
  { day: 3, label: 'Qua' },
  { day: 4, label: 'Qui' },
  { day: 5, label: 'Sex' },
  { day: 6, label: 'Sáb' },
]

export function toggleDay(
  days: readonly DayOfWeek[],
  day: DayOfWeek,
): DayOfWeek[] {
  if (days.includes(day)) return days.filter((current) => current !== day)
  return [...days, day].sort((first, second) => first - second)
}
