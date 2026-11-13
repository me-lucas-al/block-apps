import { readOAuthCallback, type Authenticator } from '@block-apps/api'
import { makeRedirectUri } from 'expo-auth-session'
import { maybeCompleteAuthSession, openAuthSessionAsync } from 'expo-web-browser'

maybeCompleteAuthSession()

export async function launchMobileGoogleAuth(authenticator: Authenticator): Promise<void> {
  const redirectUri = makeRedirectUri({ scheme: 'blockapps', path: 'auth' })
  const authorization = await authenticator.beginGoogleSignIn(redirectUri)

  const browserOutcome = await openAuthSessionAsync(authorization.url, redirectUri)
  if (browserOutcome.type !== 'success' || !browserOutcome.url) return

  const code = readOAuthCallback(browserOutcome.url, authorization.state)
  await authenticator.exchangeOAuthCode(code, authorization.verifier, redirectUri)
}
