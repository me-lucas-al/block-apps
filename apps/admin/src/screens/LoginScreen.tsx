import { loginStepFor, type LoginStep } from '@block-apps/api'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'
import { MfaSetupScreen } from './MfaSetupScreen'
import { NewPasswordScreen } from './NewPasswordScreen'
import { ResetPasswordScreen } from './ResetPasswordScreen'
import { TotpScreen } from './TotpScreen'

type AuthView = 'login' | 'new_password' | 'totp' | 'mfa_setup' | 'reset_password'

const UNCONFIRMED_ACCOUNT_MESSAGE = 'Confirme o cadastro desta conta antes de entrar.'

const VIEW_AFTER_STEP: Readonly<Record<Exclude<LoginStep, 'confirm_signup'>, AuthView>> = {
  signed_in: 'login',
  new_password: 'new_password',
  totp: 'totp',
  mfa_setup: 'mfa_setup',
  reset_password: 'reset_password',
}

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
      const step = loginStepFor(await authenticator.signInWithPassword(email.trim(), password))
      if (step === 'confirm_signup') setError(UNCONFIRMED_ACCOUNT_MESSAGE)
      else setView(VIEW_AFTER_STEP[step])
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'E-mail ou senha incorretos.')
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
        <button type="button" className="secondary" onClick={() => setView('reset_password')}>
          Esqueci a senha
        </button>
      </form>
    </main>
  )
}
