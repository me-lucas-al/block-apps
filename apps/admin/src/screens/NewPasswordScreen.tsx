import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'
import { MINIMUM_PASSWORD_LENGTH } from '../users/minimumPasswordLength'

type Props = {
  readonly onCompleted: () => void
  readonly onCancel: () => void
}

export function NewPasswordScreen({ onCompleted, onCancel }: Props) {
  const { authenticator } = useServices()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.respondToNewPassword?.(password)
      onCompleted()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao salvar senha.')
    }
  }

  return (
    <main className="center">
      <form className="card stack" onSubmit={handleSubmit}>
        <h1>Definir nova senha</h1>
        <p className="hint">Sua senha temporária expirou ou é seu primeiro acesso.</p>
        <label>
          Nova senha
          <input
            type="password"
            required
            minLength={MINIMUM_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit">Salvar e entrar</button>
        <button type="button" className="secondary" onClick={onCancel}>
          Voltar ao login
        </button>
      </form>
    </main>
  )
}
