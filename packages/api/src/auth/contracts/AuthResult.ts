export type AuthChallenge =
  | { readonly kind: 'NEW_PASSWORD_REQUIRED' }
  | { readonly kind: 'MFA_REQUIRED' }
  | { readonly kind: 'MFA_SETUP'; readonly secretCode: string }
  | { readonly kind: 'RESET_REQUIRED' }
  | { readonly kind: 'CONFIRMATION_REQUIRED' }

export type AuthResult =
  | { readonly success: true }
  | { readonly success: false; readonly challenge: AuthChallenge }
