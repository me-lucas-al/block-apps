export interface ServerClock {
  lastServerTimeIso(): string | null
}

export class ServerClockRecorder implements ServerClock {
  private lastIso: string | null = null

  recordFrom(response: Response): void {
    const dateHeader = response.headers.get('date')
    if (!dateHeader) return
    const parsedMillis = Date.parse(dateHeader)
    if (Number.isNaN(parsedMillis)) return
    this.lastIso = new Date(parsedMillis).toISOString()
  }

  lastServerTimeIso(): string | null {
    return this.lastIso
  }
}
