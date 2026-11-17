import { describe, expect, it } from 'vitest'
import { ServerClockRecorder } from '../../src/http/client/ServerClockRecorder'

function responseWithDate(dateHeader?: string): Response {
  const headers = dateHeader ? { date: dateHeader } : undefined
  return new Response(null, { headers })
}

describe('ServerClockRecorder', () => {
  it('starts without a server time', () => {
    expect(new ServerClockRecorder().lastServerTimeIso()).toBeNull()
  })

  it('keeps the Date header of the last response as an ISO instant', () => {
    const recorder = new ServerClockRecorder()
    recorder.recordFrom(responseWithDate('Mon, 16 Nov 2026 12:00:00 GMT'))
    expect(recorder.lastServerTimeIso()).toBe('2026-11-16T12:00:00.000Z')
  })

  it('ignores responses without a valid Date header', () => {
    const recorder = new ServerClockRecorder()
    recorder.recordFrom(responseWithDate('Mon, 16 Nov 2026 12:00:00 GMT'))
    recorder.recordFrom(responseWithDate())
    recorder.recordFrom(responseWithDate('garbage'))
    expect(recorder.lastServerTimeIso()).toBe('2026-11-16T12:00:00.000Z')
  })
})
