import type { BlockRule } from '@block-apps/core'

export type UserDnsState = {
  readonly rules: readonly BlockRule[]
  readonly timeZone: string
}

export interface DnsStateProvider {
  findUserId(token: string, nowMs: number): Promise<string | null>
  readUserState(userId: string, nowMs: number): Promise<UserDnsState | null>
}
