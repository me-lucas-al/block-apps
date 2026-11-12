const MILLISECONDS_PER_HOUR = 60 * 60 * 1000

export class FakeClock {
  private currentTime = new Date('2026-11-11T12:00:00.000Z')

  readonly now = (): Date => new Date(this.currentTime)

  advanceHours(hours: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + hours * MILLISECONDS_PER_HOUR)
  }
}
