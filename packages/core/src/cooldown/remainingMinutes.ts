const MILLISECONDS_PER_MINUTE = 60_000

export function remainingMinutes(effectiveAt: string, now: Date): number {
  const remainingMilliseconds = new Date(effectiveAt).getTime() - now.getTime()
  if (Number.isNaN(remainingMilliseconds) || remainingMilliseconds <= 0) return 0
  return Math.ceil(remainingMilliseconds / MILLISECONDS_PER_MINUTE)
}
