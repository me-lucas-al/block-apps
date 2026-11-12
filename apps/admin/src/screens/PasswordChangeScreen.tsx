import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'
import { describeFailure } from '../users/adminErrorMessage'

type PasswordChangeScreenProps = {
  onChanged: () => Promise<void>
}

export function PasswordChangeScreen({ onChanged }: PasswordChangeScreenProps) {
  const { profile, auth } = useServices()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitNewPassword = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await profile.changePassword(password)
      await profile.acknowledgePasswordChange()
      await onChanged()
    } catch (failure) {
      setError(describeFailure(failure))
    }
  }

  return (
    <main className="center">
      <form className="card stack" onSubmit={submitNewPassword}>
        <h1>Defina uma nova senha</h1>
        <p className="hint">Sua senha atual é temporária. Escolha uma nova para continuar.</p>
        <label>
          Nova senha
          <input type="password" required minLength={8} maxLength={72} autoComplete="new-password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit">Salvar e continuar</button>
        <button type="button" className="secondary" onClick={() => void auth.signOut()}>Sair</button>
      </form>
    </main>
  )
}
