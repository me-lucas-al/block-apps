import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GOOGLE_SIGN_IN_MESSAGE } from '../../shared/messages'
import type { BackgroundServices } from '../composition'
import { registerGoogleSignInListener } from '../googleSignInListener'

const launchExtensionGoogleAuth = vi.fn()

vi.mock('../../adapters/chrome/identity/extensionGoogleAuth', () => ({
  launchExtensionGoogleAuth: (...args: unknown[]) => launchExtensionGoogleAuth(...args),
}))

type MessageListener = (
  message: unknown,
  sender: unknown,
  sendReply: (reply: unknown) => void,
) => boolean

function registerAndCaptureListener(): MessageListener {
  let captured: MessageListener | undefined
  vi.stubGlobal('chrome', {
    runtime: { onMessage: { addListener: (listener: MessageListener) => (captured = listener) } },
  })
  registerGoogleSignInListener({ authenticator: {} } as unknown as BackgroundServices)
  return captured!
}

function replyOf(listener: MessageListener, message: unknown): Promise<unknown> {
  return new Promise((resolve) => listener(message, {}, resolve))
}

describe('registerGoogleSignInListener', () => {
  beforeEach(() => {
    launchExtensionGoogleAuth.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('replies ok after the sign in finishes', async () => {
    launchExtensionGoogleAuth.mockResolvedValue(undefined)
    const listener = registerAndCaptureListener()

    expect(await replyOf(listener, { type: GOOGLE_SIGN_IN_MESSAGE })).toEqual({ ok: true })
  })

  it('replies with the failure message when the sign in fails', async () => {
    launchExtensionGoogleAuth.mockRejectedValue(new Error('OAuth state does not match'))
    const listener = registerAndCaptureListener()

    expect(await replyOf(listener, { type: GOOGLE_SIGN_IN_MESSAGE })).toEqual({
      ok: false,
      error: 'OAuth state does not match',
    })
  })

  it('keeps the reply channel open only for the sign in message', () => {
    launchExtensionGoogleAuth.mockResolvedValue(undefined)
    const listener = registerAndCaptureListener()

    expect(listener({ type: 'rules-changed' }, {}, vi.fn())).toBe(false)
    expect(listener({ type: GOOGLE_SIGN_IN_MESSAGE }, {}, vi.fn())).toBe(true)
  })
})
