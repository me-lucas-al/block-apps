import type { LocalUserSession } from '@block-apps/api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GOOGLE_SIGN_IN_MESSAGE } from '../../../../shared/messages'
import { ChromeGoogleSignInRequester } from '../ChromeGoogleSignInRequester'

function stubBackgroundReply(reply: unknown) {
  const sendMessage = vi.fn().mockResolvedValue(reply)
  vi.stubGlobal('chrome', { runtime: { sendMessage } })
  return sendMessage
}

function buildSession() {
  const reloadFromStorage = vi.fn().mockResolvedValue(undefined)
  return { session: { reloadFromStorage } as unknown as LocalUserSession, reloadFromStorage }
}

describe('ChromeGoogleSignInRequester', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('asks the background worker and reloads the session on success', async () => {
    const sendMessage = stubBackgroundReply({ ok: true })
    const { session, reloadFromStorage } = buildSession()

    await new ChromeGoogleSignInRequester(session).requestGoogleSignIn()

    expect(sendMessage).toHaveBeenCalledWith({ type: GOOGLE_SIGN_IN_MESSAGE })
    expect(reloadFromStorage).toHaveBeenCalled()
  })

  it('throws the error sent by the background worker', async () => {
    stubBackgroundReply({ ok: false, error: 'Login cancelled' })
    const { session, reloadFromStorage } = buildSession()

    await expect(new ChromeGoogleSignInRequester(session).requestGoogleSignIn()).rejects.toThrow(
      'Login cancelled',
    )
    expect(reloadFromStorage).not.toHaveBeenCalled()
  })

  it('throws when the background worker does not answer', async () => {
    stubBackgroundReply(undefined)
    const { session } = buildSession()

    await expect(new ChromeGoogleSignInRequester(session).requestGoogleSignIn()).rejects.toThrow(
      'não respondeu',
    )
  })
})
