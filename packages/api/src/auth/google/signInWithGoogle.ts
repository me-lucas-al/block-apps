import type { Authenticator } from '../Authenticator'
import { readOAuthCallback } from '../cognito/readOAuthCallback'

export type GoogleConsentWindow = (authorizeUrl: string) => Promise<string | null>

export type GoogleSignInAuthenticator = Pick<
  Authenticator,
  'beginGoogleSignIn' | 'exchangeOAuthCode'
>

export async function signInWithGoogle(
  authenticator: GoogleSignInAuthenticator,
  redirectUri: string,
  openConsentWindow: GoogleConsentWindow,
): Promise<void> {
  const authorization = await authenticator.beginGoogleSignIn(redirectUri)
  const callbackUrl = await openConsentWindow(authorization.url)
  if (!callbackUrl) return
  const code = readOAuthCallback(callbackUrl, authorization.state)
  await authenticator.exchangeOAuthCode({ code, verifier: authorization.verifier, redirectUri })
}
