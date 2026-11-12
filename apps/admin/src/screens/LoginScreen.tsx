import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'
import { MfaSetupScreen } from './MfaSetupScreen'
import { NewPasswordScreen } from './NewPasswordScreen'
import { ResetPasswordScreen } from './ResetPasswordScreen'
import { TotpScreen } from './TotpScreen'

type AuthView = 'login' | 'new_password' | 'totp' | 'mfa_setup' | 'reset_password'

export function LoginScreen() {
  const { authenticator } = useServices()
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitLoginForm = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.signInWithPassword(email.trim(), password)
    } catch (failure) {
      const msg = failure instanceof Error ? failure.message : 'E-mail ou senha incorretos.'
      if (msg.includes('NEW_PASSWORD_REQUIRED')) setView('new_password')
      else if (msg.includes('MFA_SETUP')) setView('mfa_setup')
      else if (msg.includes('SOFTWARE_TOKEN_MFA') || msg.includes('MFA_REQUIRED')) setView('totp')
      else if (msg.includes('RESET_REQUIRED') || msg.includes('PasswordResetRequiredException')) setView('reset_password')
      else setError(msg)
    }
  }

  const startGoogleSignIn = async () => {
    try {
      setError(null)
      await authenticator.signInWithGoogle(window.location.origin)
    } catch {
      setError('O login com Google não está configurado neste ambiente.')
    }
  }

  if (view === 'new_password') return <NewPasswordScreen onCompleted={() => setView('login')} onCancel={() => setView('login')} />
  if (view === 'totp') return <TotpScreen onCompleted={() => setView('login')} onCancel={() => setView('login')} />
  if (view === 'mfa_setup') return <MfaSetupScreen onCompleted={() => setView('login')} onCancel={() => setView('login')} />
  if (view === 'reset_password') return <ResetPasswordScreen initialEmail={email} onCompleted={() => setView('login')} onCancel={() => setView('login')} />

  return (
    <main className="center">
      <form className="card stack" onSubmit={submitLoginForm}>
        <h1>Block Apps</h1>
        <p className="hint">Área do administrador</p>
        <label>
          E-mail
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit">Entrar</button>
        <button type="button" className="secondary" onClick={() => void startGoogleSignIn()}>
          Entrar com Google
        </button>
        <button type="button" className="secondary" onClick={() => setView('reset_password')}>
          Esqueci a senha
        </button>
      </form>
    </main>
  )
}
