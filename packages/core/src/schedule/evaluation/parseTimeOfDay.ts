const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export function parseTimeOfDay(timeOfDay: string): number {
  const match = TIME_OF_DAY_PATTERN.exec(timeOfDay)
  if (!match) {
    throw new RangeError(`Invalid time of day: ${timeOfDay}`)
  }
  const [, hours, minutes] = match
  return Number(hours) * 60 + Number(minutes)
}
