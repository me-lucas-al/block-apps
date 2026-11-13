import { afterEach, describe, expect, it, vi } from 'vitest'
import { GOOGLE_SIGN_IN_MESSAGE } from '../../../../shared/messages'
import { ChromeGoogleSignInRequester } from '../ChromeGoogleSignInRequester'

function stubBackgroundReply(reply: unknown) {
  const sendMessage = vi.fn().mockResolvedValue(reply)
  vi.stubGlobal('chrome', { runtime: { sendMessage } })
  return sendMessage
}

describe('ChromeGoogleSignInRequester', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('asks the background worker to sign in', async () => {
    const sendMessage = stubBackgroundReply({ ok: true })

    await new ChromeGoogleSignInRequester().requestGoogleSignIn()

    expect(sendMessage).toHaveBeenCalledWith({ type: GOOGLE_SIGN_IN_MESSAGE })
  })

  it('throws the error sent by the background worker', async () => {
    stubBackgroundReply({ ok: false, error: 'Login cancelled' })

    await expect(new ChromeGoogleSignInRequester().requestGoogleSignIn()).rejects.toThrow(
      'Login cancelled',
    )
  })

  it('throws a portuguese message when the background worker does not answer', async () => {
    stubBackgroundReply(undefined)

    await expect(new ChromeGoogleSignInRequester().requestGoogleSignIn()).rejects.toThrow(
      'serviço em segundo plano',
    )
  })

  it('throws a portuguese message when the connection fails', async () => {
    vi.stubGlobal('chrome', {
      runtime: {
        sendMessage: vi.fn().mockRejectedValue(new Error('Could not establish connection.')),
      },
    })

    await expect(new ChromeGoogleSignInRequester().requestGoogleSignIn()).rejects.toThrow(
      'serviço em segundo plano',
    )
  })
})
