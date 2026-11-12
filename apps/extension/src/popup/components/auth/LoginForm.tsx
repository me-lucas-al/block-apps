import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../../services/ServicesContext'

type Authenticate = (email: string, password: string) => Promise<void>

export function LoginForm() {
  const { authenticator } = useServices()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitCredentialsWith = (authenticate: Authenticate) => async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticate(email, password)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro inesperado')
    }
  }

  const signInWithPassword: Authenticate = (typedEmail, typedPassword) =>
    authenticator.signInWithPassword(typedEmail, typedPassword)
  const signUpWithPassword: Authenticate = (typedEmail, typedPassword) =>
    authenticator.signUpWithPassword(typedEmail, typedPassword)

  return (
    <form className="stack" onSubmit={submitCredentialsWith(signInWithPassword)}>
      <h2>Entrar</h2>
      <input type="email" placeholder="E-mail" value={email} required
        onChange={(event) => setEmail(event.target.value)} />
      <input type="password" placeholder="Senha" value={password} required minLength={6}
        onChange={(event) => setPassword(event.target.value)} />
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="submit">Entrar</button>
        <button type="button" className="secondary" onClick={submitCredentialsWith(signUpWithPassword)}>
          Criar conta
        </button>
      </div>
    </form>
  )
}
