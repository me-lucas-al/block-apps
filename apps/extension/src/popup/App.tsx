import { LoginForm } from './components/auth/LoginForm'
import { RulesPanel } from './components/rules/list/RulesPanel'
import { IncognitoWarning } from './components/status/IncognitoWarning'
import { useRefreshRulesWhenSignedIn } from './hooks/useRefreshRulesWhenSignedIn'
import { useSessionEmail } from './hooks/useSessionEmail'
import { useSessionSync } from './hooks/useSessionSync'
import { useSignOut } from './hooks/useSignOut'

export function App() {
  const signOut = useSignOut()
  useSessionSync()
  const { email, loading } = useSessionEmail()
  useRefreshRulesWhenSignedIn(email)

  if (loading) return <p className="hint">Carregando…</p>
  if (!email) return <LoginForm />

  return (
    <main className="stack">
      <header className="row between">
        <span className="hint">{email}</span>
        <button type="button" className="secondary" onClick={() => void signOut()}>
          Sair
        </button>
      </header>
      <IncognitoWarning />
      <RulesPanel />
    </main>
  )
}
