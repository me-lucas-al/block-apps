const MILLISECONDS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60

export function remainingMinutes(effectiveAt: string, now: Date): number {
  const remainingMilliseconds = new Date(effectiveAt).getTime() - now.getTime()
  if (remainingMilliseconds <= 0) return 0
  return Math.ceil(remainingMilliseconds / MILLISECONDS_PER_MINUTE)
}

export function formatRemaining(effectiveAt: string, now: Date): string {
  const totalMinutes = remainingMinutes(effectiveAt, now)
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR)
  const minutes = totalMinutes % MINUTES_PER_HOUR
  if (hours === 0) return `${minutes}min`
  return `${hours}h ${minutes}min`
}
