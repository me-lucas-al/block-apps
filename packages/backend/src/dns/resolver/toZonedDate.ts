const formatters = new Map<string, Intl.DateTimeFormat>()

function createFormatter(timeZone: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
}

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const existing = formatters.get(timeZone)
  if (existing) return existing
  try {
    const formatter = createFormatter(timeZone)
    formatters.set(timeZone, formatter)
    return formatter
  } catch {
    return getFormatter('UTC')
  }
}

function readPart(parts: readonly Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  const partText = parts.find((part) => part.type === type)?.value
  return Number(partText ?? 0)
}

export function toZonedDate(instant: Date, timeZone: string): Date {
  const parts = getFormatter(timeZone).formatToParts(instant)
  const year = readPart(parts, 'year')
  const month = readPart(parts, 'month')
  const day = readPart(parts, 'day')
  const hour = readPart(parts, 'hour') % 24
  const minute = readPart(parts, 'minute')
  return new Date(year, month - 1, day, hour, minute)
}
