import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../../services/ServicesContext'

type Props = {
  readonly onCompleted: () => void
}

export function NewPasswordForm({ onCompleted }: Props) {
  const { authenticator } = useServices()
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.respondToNewPassword?.(newPassword)
      onCompleted()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao redefinir senha')
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <h2>Nova senha</h2>
      <p>Defina uma nova senha para acessar sua conta.</p>
      <input
        type="password"
        placeholder="Nova senha"
        value={newPassword}
        required
        minLength={8}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Salvar nova senha</button>
    </form>
  )
}
