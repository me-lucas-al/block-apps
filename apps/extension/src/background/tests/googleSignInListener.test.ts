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
  sender: { id?: string },
  sendReply: (reply: unknown) => void,
) => boolean

const ownSender = { id: 'extension-id' }
const signInMessage = { type: GOOGLE_SIGN_IN_MESSAGE }

function registerAndCaptureListener(): MessageListener {
  let captured: MessageListener | undefined
  vi.stubGlobal('chrome', {
    runtime: {
      id: 'extension-id',
      onMessage: { addListener: (listener: MessageListener) => (captured = listener) },
    },
  })
  registerGoogleSignInListener({ authenticator: {} } as unknown as BackgroundServices)
  return captured!
}

function replyOf(listener: MessageListener, message: unknown): Promise<unknown> {
  return new Promise((resolve) => listener(message, ownSender, resolve))
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

    expect(await replyOf(listener, signInMessage)).toEqual({ ok: true })
  })

  it('replies with the failure message when the sign in fails', async () => {
    launchExtensionGoogleAuth.mockRejectedValue(new Error('OAuth state does not match'))
    const listener = registerAndCaptureListener()

    expect(await replyOf(listener, signInMessage)).toEqual({
      ok: false,
      error: 'OAuth state does not match',
    })
  })

  it('keeps the reply channel open only for the sign in message', () => {
    launchExtensionGoogleAuth.mockResolvedValue(undefined)
    const listener = registerAndCaptureListener()

    expect(listener({ type: 'rules-changed' }, ownSender, vi.fn())).toBe(false)
    expect(listener(signInMessage, ownSender, vi.fn())).toBe(true)
  })

  it('ignores messages that do not come from this extension', () => {
    const listener = registerAndCaptureListener()

    expect(listener(signInMessage, { id: 'other-extension' }, vi.fn())).toBe(false)
    expect(launchExtensionGoogleAuth).not.toHaveBeenCalled()
  })

  it('shares one sign in between concurrent requests and allows another one afterwards', async () => {
    let finishSignIn: () => void = () => undefined
    launchExtensionGoogleAuth.mockImplementation(
      () => new Promise<void>((resolve) => (finishSignIn = resolve)),
    )
    const listener = registerAndCaptureListener()

    const firstReply = replyOf(listener, signInMessage)
    const secondReply = replyOf(listener, signInMessage)
    finishSignIn()
    await Promise.all([firstReply, secondReply])
    expect(launchExtensionGoogleAuth).toHaveBeenCalledTimes(1)

    launchExtensionGoogleAuth.mockResolvedValue(undefined)
    await replyOf(listener, signInMessage)
    expect(launchExtensionGoogleAuth).toHaveBeenCalledTimes(2)
  })
})
