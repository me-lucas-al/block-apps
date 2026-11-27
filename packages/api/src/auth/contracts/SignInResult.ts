export type SignInResult =
  | { readonly kind: 'signed_in' }
  | { readonly kind: 'mfa_totp_required' }
  | { readonly kind: 'mfa_setup_required'; readonly secretCode: string }
  | { readonly kind: 'new_password_required' }
  | { readonly kind: 'unconfirmed_user' }
  | { readonly kind: 'password_reset_required' }
