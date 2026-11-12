import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'
import type { MyProfile } from '../ports/ProfileGateway'
import { describeFailure } from '../users/adminErrorMessage'

type MyAccountScreenProps = {
  profile: MyProfile
  onChanged: () => Promise<void>
}

export function MyAccountScreen({ profile, onChanged }: MyAccountScreenProps) {
  const { profile: gateway } = useServices()
  const [displayName, setDisplayName] = useState(profile.displayName ?? '')
  const [email, setEmail] = useState(profile.email)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitAccountForm = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      setMessage(null)
      const name = displayName.trim()
      await gateway.updateDisplayName(name === '' ? null : name)
      if (email.trim() !== profile.email) await gateway.changeEmail(email.trim())
      if (password !== '') await gateway.changePassword(password)
      setPassword('')
      await onChanged()
      setMessage('Dados salvos. Se mudou o e-mail, confirme pelo link enviado.')
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
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Nova senha (deixe em branco para manter)
          <input type="password" autoComplete="new-password" minLength={8} maxLength={72}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        {message && <p className="hint" role="status">{message}</p>}
        <button type="submit">Salvar</button>
      </form>
    </section>
  )
}
