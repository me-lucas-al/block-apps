import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../../services/ServicesContext'

export function LoginForm() {
  const { auth } = useServices()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitWith = (action: typeof auth.signIn) => async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await action.call(auth, email, password)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro inesperado')
    }
  }

  return (
    <form className="stack" onSubmit={submitWith(auth.signIn)}>
      <h2>Entrar</h2>
      <input type="email" placeholder="E-mail" value={email} required
        onChange={(event) => setEmail(event.target.value)} />
      <input type="password" placeholder="Senha" value={password} required minLength={6}
        onChange={(event) => setPassword(event.target.value)} />
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="submit">Entrar</button>
        <button type="button" className="secondary" onClick={submitWith(auth.signUp)}>
          Criar conta
        </button>
      </div>
    </form>
  )
}
