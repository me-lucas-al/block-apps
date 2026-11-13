import type { AuthChallenge, AuthResult } from './contracts/AuthResult'

export type LoginStep =
  | 'signed_in'
  | 'new_password'
  | 'totp'
  | 'mfa_setup'
  | 'reset_password'
  | 'confirm_signup'

const STEP_BY_CHALLENGE: Readonly<Record<AuthChallenge['kind'], LoginStep>> = {
  NEW_PASSWORD_REQUIRED: 'new_password',
  MFA_REQUIRED: 'totp',
  MFA_SETUP: 'mfa_setup',
  RESET_REQUIRED: 'reset_password',
  CONFIRMATION_REQUIRED: 'confirm_signup',
}

export function loginStepFor(authResult: AuthResult): LoginStep {
  return authResult.success ? 'signed_in' : STEP_BY_CHALLENGE[authResult.challenge.kind]
}
