import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'

export function LoginScreen() {
  const { auth } = useServices()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitLoginForm = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await auth.signIn(email.trim(), password)
    } catch {
      setError('E-mail ou senha incorretos.')
    }
  }

  const startGoogleSignIn = async () => {
    try {
      setError(null)
      await auth.signInWithGoogle(window.location.origin)
    } catch {
      setError('O login com Google não está configurado neste ambiente.')
    }
  }

  return (
    <main className="center">
      <form className="card stack" onSubmit={submitLoginForm}>
        <h1>Block Apps</h1>
        <p className="hint">Área do administrador</p>
        <label>
          E-mail
          <input type="email" required autoComplete="username" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" required autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit">Entrar</button>
        <button type="button" className="secondary" onClick={() => void startGoogleSignIn()}>
          Entrar com Google
        </button>
      </form>
    </main>
  )
}
