import { assertUnreachableSignInResult, type SignInResult } from '@block-apps/api'

export type LoginStep =
  | { readonly step: 'login'; readonly notice: string | null }
  | { readonly step: 'new_password' }
  | { readonly step: 'totp' }
  | { readonly step: 'confirm_signup' }
  | { readonly step: 'forgot_password' }

export const MFA_SETUP_UNSUPPORTED_NOTICE =
  'Esta conta exige configurar o MFA. Conclua a configuração no painel de administração.'

export function describeNextLoginStep(signInResult: SignInResult): LoginStep {
  switch (signInResult.kind) {
    case 'signed_in':
      return { step: 'login', notice: null }
    case 'new_password_required':
      return { step: 'new_password' }
    case 'mfa_totp_required':
      return { step: 'totp' }
    case 'unconfirmed_user':
      return { step: 'confirm_signup' }
    case 'password_reset_required':
      return { step: 'forgot_password' }
    case 'mfa_setup_required':
      return { step: 'login', notice: MFA_SETUP_UNSUPPORTED_NOTICE }
    default:
      return assertUnreachableSignInResult(signInResult)
  }
}
