export const RULES_CHANGED_MESSAGE = 'rules-changed'
export const GOOGLE_SIGN_IN_MESSAGE = 'google-sign-in'

export type GoogleSignInReply =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string }

export const ENFORCE_ALARM = 'enforce-blocking'
export const REFRESH_ALARM = 'refresh-rules'
