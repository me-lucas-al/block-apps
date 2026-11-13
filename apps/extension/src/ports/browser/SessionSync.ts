import type { Unsubscribe } from '@block-apps/api'

export interface SessionSync {
  start(): Unsubscribe
}
