import { launchExtensionGoogleAuth } from '../adapters/chrome/identity/extensionGoogleAuth'
import { GOOGLE_SIGN_IN_MESSAGE, type GoogleSignInReply } from '../shared/messages'
import type { BackgroundServices } from './composition'
import { logFailure } from './logFailure'

function buildGoogleSignInFailureReply(failure: unknown): GoogleSignInReply {
  const error = failure instanceof Error ? failure.message : 'Erro no login com Google'
  return { ok: false, error }
}

export function registerGoogleSignInListener({ authenticator }: BackgroundServices): void {
  let signInInProgress: Promise<GoogleSignInReply> | null = null

  const signInOnce = (): Promise<GoogleSignInReply> => {
    if (signInInProgress) return signInInProgress
    const attempt = launchExtensionGoogleAuth(authenticator)
      .then((): GoogleSignInReply => ({ ok: true }))
      .catch((failure: unknown) => {
        logFailure('google sign in')(failure)
        return buildGoogleSignInFailureReply(failure)
      })
    signInInProgress = attempt.finally(() => {
      signInInProgress = null
    })
    return signInInProgress
  }

  chrome.runtime.onMessage.addListener((message, sender, sendReply) => {
    if (sender.id !== chrome.runtime.id) return false
    if (message?.type !== GOOGLE_SIGN_IN_MESSAGE) return false
    void signInOnce().then(sendReply)
    return true
  })
}
