import type { DayOfWeek, TimeWindow } from '@block-apps/core'
import { ValidationError } from '../../../domain/errors/ValidationError'
import { readRecord } from '../fields/readRecord'
import { readTextField } from '../fields/readTextField'

const TIME_OF_DAY = /^([01][0-9]|2[0-3]):[0-5][0-9]$/

function parseDay(day: unknown): DayOfWeek {
  if (typeof day !== 'number' || !Number.isInteger(day) || day < 0 || day > 6) {
    throw new ValidationError('days must be integers from 0 to 6')
  }
  return day as DayOfWeek
}

function parseTimeOfDayField(record: Record<string, unknown>, field: string): string {
  const time = readTextField(record, field)
  if (!TIME_OF_DAY.test(time)) throw new ValidationError(`${field} must be HH:mm`)
  return time
}

function parseTimeWindow(rawWindow: unknown): TimeWindow {
  const record = readRecord(rawWindow, 'window')
  const rawDays = record['days']
  if (!Array.isArray(rawDays)) throw new ValidationError('days must be an array')
  return {
    days: rawDays.map(parseDay),
    start: parseTimeOfDayField(record, 'start'),
    end: parseTimeOfDayField(record, 'end'),
  }
}

export function parseTimeWindows(rawWindows: unknown): TimeWindow[] {
  if (rawWindows === undefined) return []
  if (!Array.isArray(rawWindows)) throw new ValidationError('windows must be an array')
  return rawWindows.map(parseTimeWindow)
}
