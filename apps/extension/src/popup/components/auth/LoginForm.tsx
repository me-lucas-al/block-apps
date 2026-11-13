import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLoginFlow } from '../../hooks/useLoginFlow'
import { ConfirmSignUpForm } from './ConfirmSignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { NewPasswordForm } from './NewPasswordForm'
import { TotpForm } from './TotpForm'

export function LoginForm() {
  const loginFlow = useLoginFlow()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { view, error, returnToLogin } = loginFlow

  const submitLoginForm = (event: FormEvent) => {
    event.preventDefault()
    void loginFlow.submitCredentials(email.trim(), password)
  }

  if (view === 'confirm_signup') {
    return <ConfirmSignUpForm email={email.trim()} onConfirmed={returnToLogin} onCancel={returnToLogin} />
  }
  if (view === 'new_password') return <NewPasswordForm onCompleted={returnToLogin} />
  if (view === 'totp') return <TotpForm onCompleted={returnToLogin} />
  if (view === 'forgot_password') {
    return <ForgotPasswordForm initialEmail={email} onCancel={returnToLogin} onCompleted={returnToLogin} />
  }

  return (
    <form className="stack" onSubmit={submitLoginForm}>
      <h2>Entrar</h2>
      <input type="email" placeholder="E-mail" value={email} required onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Senha" value={password} required minLength={6} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="submit">Entrar</button>
        <button type="button" className="secondary" onClick={() => void loginFlow.registerAccount(email.trim(), password)}>Criar conta</button>
      </div>
      <div className="row">
        <button type="button" className="secondary" onClick={() => void loginFlow.startGoogleSignIn()}>Entrar com Google</button>
        <button type="button" className="secondary" onClick={loginFlow.openPasswordReset}>Esqueci a senha</button>
      </div>
    </form>
  )
}
