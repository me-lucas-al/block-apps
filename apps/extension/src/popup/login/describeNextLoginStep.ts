import { assertUnreachableSignInResult, type SignInResult } from '@block-apps/api'

export type LoginStep =
  | { readonly view: 'login'; readonly notice: string | null }
  | { readonly view: 'new_password' }
  | { readonly view: 'totp' }
  | { readonly view: 'confirm_signup' }
  | { readonly view: 'forgot_password' }

export const MFA_SETUP_UNSUPPORTED_NOTICE =
  'Esta conta exige configurar o MFA. Conclua a configuração no painel de administração.'

export function describeNextLoginStep(signInResult: SignInResult): LoginStep {
  switch (signInResult.kind) {
    case 'signed_in':
      return { view: 'login', notice: null }
    case 'new_password_required':
      return { view: 'new_password' }
    case 'mfa_totp_required':
      return { view: 'totp' }
    case 'unconfirmed_user':
      return { view: 'confirm_signup' }
    case 'password_reset_required':
      return { view: 'forgot_password' }
    case 'mfa_setup_required':
      return { view: 'login', notice: MFA_SETUP_UNSUPPORTED_NOTICE }
    default:
      return assertUnreachableSignInResult(signInResult)
  }
}
