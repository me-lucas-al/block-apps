import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'
import { describeFailure } from '../users/adminErrorMessage'
import { MINIMUM_PASSWORD_LENGTH } from '../users/minimumPasswordLength'

type PasswordChangeScreenProps = {
  onPasswordChanged: () => Promise<void>
}

export function PasswordChangeScreen({ onPasswordChanged }: PasswordChangeScreenProps) {
  const { profile: profileGateway, authenticator } = useServices()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const submitNewPassword = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setErrorMessage(null)
      await profileGateway.changePassword(currentPassword, newPassword)
      await onPasswordChanged()
    } catch (failure) {
      setErrorMessage(describeFailure(failure))
    }
  }

  return (
    <main className="center">
      <form className="card stack" onSubmit={submitNewPassword}>
        <h1>Defina uma nova senha</h1>
        <p className="hint">Informe a senha temporária e escolha uma nova para continuar.</p>
        <label>
          Senha atual
          <input type="password" required maxLength={72} autoComplete="current-password"
            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </label>
        <label>
          Nova senha
          <input type="password" required minLength={MINIMUM_PASSWORD_LENGTH} maxLength={72} autoComplete="new-password"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
        {errorMessage && <p className="error" role="alert">{errorMessage}</p>}
        <button type="submit">Salvar e continuar</button>
        <button type="button" className="secondary" onClick={() => void authenticator.signOut()}>Sair</button>
      </form>
    </main>
  )
}
