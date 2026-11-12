import type { Authenticator } from '@block-apps/api'

export async function handleAdminOAuthCallback(authenticator: Authenticator): Promise<void> {
  if (typeof window === 'undefined' || !window.location.search) return
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (!code || !authenticator.exchangeOAuthCode) return

  try {
    await authenticator.exchangeOAuthCode(code, undefined, window.location.origin)
  } finally {
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}
