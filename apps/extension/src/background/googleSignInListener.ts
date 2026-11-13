import { launchExtensionGoogleAuth } from '../adapters/chrome/identity/extensionGoogleAuth'
import { GOOGLE_SIGN_IN_MESSAGE, type GoogleSignInReply } from '../shared/messages'
import type { BackgroundServices } from './composition'
import { logFailure } from './logFailure'

function describeGoogleSignInFailure(failure: unknown): GoogleSignInReply {
  const error = failure instanceof Error ? failure.message : 'Erro no login com Google'
  return { ok: false, error }
}

export function registerGoogleSignInListener({ authenticator }: BackgroundServices): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendReply) => {
    if (message?.type !== GOOGLE_SIGN_IN_MESSAGE) return false
    launchExtensionGoogleAuth(authenticator)
      .then((): GoogleSignInReply => ({ ok: true }))
      .catch((failure: unknown) => {
        logFailure('google sign in')(failure)
        return describeGoogleSignInFailure(failure)
      })
      .then(sendReply)
    return true
  })
}
