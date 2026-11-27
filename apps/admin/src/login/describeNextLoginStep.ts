import { assertUnreachableSignInResult, type SignInResult } from '@block-apps/api'

export type LoginStep =
  | { readonly view: 'login'; readonly notice: string | null }
  | { readonly view: 'new_password' }
  | { readonly view: 'totp' }
  | { readonly view: 'mfa_setup'; readonly secretCode: string }
  | { readonly view: 'reset_password' }

export const UNCONFIRMED_USER_NOTICE =
  'Sua conta ainda não foi confirmada. Peça a um administrador para confirmá-la.'

export function describeNextLoginStep(signInResult: SignInResult): LoginStep {
  switch (signInResult.kind) {
    case 'signed_in':
      return { view: 'login', notice: null }
    case 'new_password_required':
      return { view: 'new_password' }
    case 'mfa_totp_required':
      return { view: 'totp' }
    case 'mfa_setup_required':
      return { view: 'mfa_setup', secretCode: signInResult.secretCode }
    case 'password_reset_required':
      return { view: 'reset_password' }
    case 'unconfirmed_user':
      return { view: 'login', notice: UNCONFIRMED_USER_NOTICE }
    default:
      return assertUnreachableSignInResult(signInResult)
  }
}
