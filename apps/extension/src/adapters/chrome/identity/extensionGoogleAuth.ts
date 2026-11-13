import { signInWithGoogle, type GoogleSignInAuthenticator } from '@block-apps/api'

function openGoogleConsentWindow(authorizeUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url: authorizeUrl, interactive: true }, (callbackUrl) => {
      if (chrome.runtime.lastError || !callbackUrl) {
        reject(new Error(chrome.runtime.lastError?.message ?? 'OAuth flow failed'))
        return
      }
      resolve(callbackUrl)
    })
  })
}

export function launchExtensionGoogleAuth(authenticator: GoogleSignInAuthenticator): Promise<void> {
  return signInWithGoogle(authenticator, chrome.identity.getRedirectURL(), openGoogleConsentWindow)
}
