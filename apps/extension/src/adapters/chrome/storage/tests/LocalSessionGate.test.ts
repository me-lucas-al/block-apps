import { describe, expect, it } from 'vitest'
import { LocalSessionGate } from '../LocalSessionGate'
import type { UserSession } from '@block-apps/api'

describe('LocalSessionGate', () => {
  it('returns true when session has token and false when null', async () => {
    let token: string | null = 'tok-123'
    const session: Partial<UserSession> = {
      currentIdToken: async () => token,
    }

    const gate = new LocalSessionGate(session as UserSession)
    expect(await gate.hasSession()).toBe(true)

    token = null
    expect(await gate.hasSession()).toBe(false)
  })
})
