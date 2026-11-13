import type { AuthResult } from './contracts/AuthResult'
import type { GoogleAuthorization } from './contracts/GoogleAuthorization'

export interface Authenticator {
  signInWithPassword(email: string, password: string): Promise<AuthResult>
  beginGoogleSignIn(redirectUri: string): Promise<GoogleAuthorization>
  exchangeOAuthCode(code: string, verifier: string, redirectUri: string): Promise<void>
  signUpWithPassword(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  respondToNewPassword?(newPassword: string): Promise<void>
  changePassword?(currentPassword: string, newPassword: string): Promise<void>
  respondToMfaCode?(totpCode: string): Promise<void>
  respondToMfaSetup?(totpCode: string): Promise<void>
  beginTotpEnrollment?(): Promise<string>
  confirmTotpEnrollment?(totpCode: string): Promise<void>
  confirmSignUp?(email: string, code: string): Promise<void>
  resendConfirmationCode?(email: string): Promise<void>
  requestPasswordReset?(email: string): Promise<void>
  confirmPasswordReset?(email: string, code: string, nextPass: string): Promise<void>
}
