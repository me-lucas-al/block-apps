import { useState } from 'react'
import type { FormEvent } from 'react'
import { launchExtensionGoogleAuth } from '../../../adapters/chrome/identity/extensionGoogleAuth'
import { useServices } from '../../services/ServicesContext'
import { ConfirmSignUpForm } from './ConfirmSignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { NewPasswordForm } from './NewPasswordForm'
import { TotpForm } from './TotpForm'

type AuthView = 'login' | 'confirm_signup' | 'new_password' | 'totp' | 'forgot_password'

export function LoginForm() {
  const { authenticator } = useServices()
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.signInWithPassword(email.trim(), password)
    } catch (failure) {
      const msg = failure instanceof Error ? failure.message : 'Erro ao entrar'
      if (msg.includes('NEW_PASSWORD_REQUIRED')) setView('new_password')
      else if (msg.includes('MFA_REQUIRED')) setView('totp')
      else setError(msg)
    }
  }

  const handleSignUp = async () => {
    try {
      setError(null)
      await authenticator.signUpWithPassword(email.trim(), password)
      setView('confirm_signup')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro ao cadastrar')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      await launchExtensionGoogleAuth(authenticator)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro no login Google')
    }
  }

  if (view === 'confirm_signup') {
    return <ConfirmSignUpForm email={email} onConfirmed={() => setView('login')} onCancel={() => setView('login')} />
  }
  if (view === 'new_password') return <NewPasswordForm onCompleted={() => setView('login')} />
  if (view === 'totp') return <TotpForm onCompleted={() => setView('login')} />
  if (view === 'forgot_password') {
    return <ForgotPasswordForm initialEmail={email} onCancel={() => setView('login')} onCompleted={() => setView('login')} />
  }

  return (
    <form className="stack" onSubmit={handleSignIn}>
      <h2>Entrar</h2>
      <input type="email" placeholder="E-mail" value={email} required onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Senha" value={password} required minLength={6} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="submit">Entrar</button>
        <button type="button" className="secondary" onClick={handleSignUp}>Criar conta</button>
      </div>
      <div className="row">
        <button type="button" className="secondary" onClick={handleGoogleSignIn}>Entrar com Google</button>
        <button type="button" className="secondary" onClick={() => setView('forgot_password')}>Esqueci a senha</button>
      </div>
    </form>
  )
}
