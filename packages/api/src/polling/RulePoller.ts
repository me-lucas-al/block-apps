import type { Unsubscribe } from '../subscription/Unsubscribe'

export type RulePollerConfig = {
  readonly pollIntervalMs?: number
  readonly poll: () => Promise<void>
}

export class RulePoller {
  private readonly listeners = new Set<() => void>()
  private timer: ReturnType<typeof setInterval> | null = null
  private readonly intervalMs: number

  constructor(private readonly config: RulePollerConfig) {
    this.intervalMs = config.pollIntervalMs ?? 5 * 60 * 1000
  }

  subscribe(onRuleChanged: () => void): Unsubscribe {
    this.listeners.add(onRuleChanged)
    if (this.listeners.size === 1) {
      this.startTimer()
    }
    return () => {
      this.listeners.delete(onRuleChanged)
      if (this.listeners.size === 0) {
        this.stopTimer()
      }
    }
  }

  async pollNow(): Promise<void> {
    try {
      await this.config.poll()
      for (const listener of this.listeners) {
        listener()
      }
    } catch {
      return
    }
  }

  private startTimer(): void {
    if (this.timer) return
    this.timer = setInterval(() => void this.pollNow(), this.intervalMs)
  }

  private stopTimer(): void {
    if (!this.timer) return
    clearInterval(this.timer)
    this.timer = null
  }
}
