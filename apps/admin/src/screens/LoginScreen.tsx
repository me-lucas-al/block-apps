import { useLoginFlow } from '../login/useLoginFlow'
import { MfaSetupScreen } from './MfaSetupScreen'
import { NewPasswordScreen } from './NewPasswordScreen'
import { ResetPasswordScreen } from './ResetPasswordScreen'
import { TotpScreen } from './TotpScreen'

export function LoginScreen() {
  const {
    step,
    email,
    password,
    error,
    setEmail,
    setPassword,
    submitLoginForm,
    returnToLogin,
    openPasswordReset,
  } = useLoginFlow()

  if (step.view === 'new_password') return <NewPasswordScreen onCompleted={returnToLogin} onCancel={returnToLogin} />
  if (step.view === 'totp') return <TotpScreen onCompleted={returnToLogin} onCancel={returnToLogin} />
  if (step.view === 'mfa_setup') {
    return <MfaSetupScreen email={email.trim()} secretCode={step.secretCode} onCompleted={returnToLogin} onCancel={returnToLogin} />
  }
  if (step.view === 'reset_password') return <ResetPasswordScreen initialEmail={email} onCompleted={returnToLogin} onCancel={returnToLogin} />

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
        <button type="button" className="secondary" onClick={openPasswordReset}>
          Esqueci a senha
        </button>
      </form>
    </main>
  )
}
