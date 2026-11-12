import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'
import type { MyProfile } from '../ports/ProfileGateway'
import { describeFailure } from '../users/adminErrorMessage'
import { MINIMUM_PASSWORD_LENGTH } from '../users/minimumPasswordLength'

type MyAccountScreenProps = {
  profile: MyProfile
  onChanged: () => Promise<void>
}

export function MyAccountScreen({ profile, onChanged }: MyAccountScreenProps) {
  const { profile: gateway } = useServices()
  const [displayName, setDisplayName] = useState(profile.displayName ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitAccountForm = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      setMessage(null)
      const name = displayName.trim()
      await gateway.updateMyDisplayName(name === '' ? null : name)
      if (password !== '') await gateway.changePassword(currentPassword, password)
      setCurrentPassword('')
      setPassword('')
      await onChanged()
      setMessage('Dados salvos.')
    } catch (failure) {
      setError(describeFailure(failure))
    }
  }

  return (
    <section className="stack">
      <h1>Minha conta</h1>
      <form className="card stack" onSubmit={submitAccountForm}>
        <label>
          Nome
          <input value={displayName} maxLength={80} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <label>
          E-mail
          <input type="email" value={profile.email} readOnly />
        </label>
        <label>
          Senha atual (obrigatória para trocar a senha)
          <input type="password" autoComplete="current-password" maxLength={72} required={password !== ''}
            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </label>
        <label>
          Nova senha (deixe em branco para manter)
          <input type="password" autoComplete="new-password" minLength={MINIMUM_PASSWORD_LENGTH} maxLength={72}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        {message && <p className="hint" role="status">{message}</p>}
        <button type="submit">Salvar</button>
      </form>
    </section>
  )
}
