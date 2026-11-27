import { useLoginFlow } from '../../login/useLoginFlow'
import { ConfirmSignUpForm } from './ConfirmSignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { NewPasswordForm } from './NewPasswordForm'
import { TotpForm } from './TotpForm'

export function LoginForm() {
  const {
    step,
    email,
    password,
    error,
    setEmail,
    setPassword,
    submitLoginForm,
    startAccountSignUp,
    startGoogleSignIn,
    returnToLogin,
    openPasswordReset,
  } = useLoginFlow()

  if (step.view === 'confirm_signup') {
    return <ConfirmSignUpForm email={email} onConfirmed={returnToLogin} onCancel={returnToLogin} />
  }
  if (step.view === 'new_password') return <NewPasswordForm onCompleted={returnToLogin} />
  if (step.view === 'totp') return <TotpForm onCompleted={returnToLogin} />
  if (step.view === 'forgot_password') {
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
        <button type="button" className="secondary" onClick={startAccountSignUp}>Criar conta</button>
      </div>
      <div className="row">
        <button type="button" className="secondary" onClick={startGoogleSignIn}>Entrar com Google</button>
        <button type="button" className="secondary" onClick={openPasswordReset}>Esqueci a senha</button>
      </div>
    </form>
  )
}
