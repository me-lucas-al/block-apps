import { signInWithGoogle, type GoogleSignInAuthenticator } from '@block-apps/api'
import { makeRedirectUri } from 'expo-auth-session'
import { maybeCompleteAuthSession, openAuthSessionAsync } from 'expo-web-browser'

maybeCompleteAuthSession()

export function launchMobileGoogleAuth(authenticator: GoogleSignInAuthenticator): Promise<void> {
  const redirectUri = makeRedirectUri({ scheme: 'blockapps', path: 'auth' })
  return signInWithGoogle(authenticator, redirectUri, async (authorizeUrl) => {
    const browserOutcome = await openAuthSessionAsync(authorizeUrl, redirectUri)
    if (browserOutcome.type !== 'success') return null
    return browserOutcome.url
  })
}
