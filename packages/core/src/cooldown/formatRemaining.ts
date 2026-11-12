import { remainingMinutes } from './remainingMinutes'

const MINUTES_PER_HOUR = 60

export function formatRemaining(effectiveAt: string, now: Date): string {
  const totalMinutes = remainingMinutes(effectiveAt, now)
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR)
  const minutes = totalMinutes % MINUTES_PER_HOUR
  if (hours === 0) return `${minutes}min`
  return `${hours}h ${minutes}min`
}
