import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'
import { MINIMUM_PASSWORD_LENGTH } from '../users/minimumPasswordLength'

type Props = {
  readonly initialEmail: string
  readonly onCompleted: () => void
  readonly onCancel: () => void
}

export function ResetPasswordScreen({ initialEmail, onCompleted, onCancel }: Props) {
  const { authenticator } = useServices()
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [error, setError] = useState<string | null>(null)

  const handleRequest = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.requestPasswordReset?.(email.trim())
      setStep('confirm')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao solicitar código.')
    }
  }

  const handleConfirm = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.confirmPasswordReset?.(email.trim(), code.trim(), newPassword)
      onCompleted()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao redefinir senha.')
    }
  }

  if (step === 'confirm') {
    return (
      <main className="center">
        <form className="card stack" onSubmit={handleConfirm}>
          <h1>Redefinir senha</h1>
          <p className="hint">Código enviado para {email}</p>
          <label>
            Código recebido
            <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <label>
            Nova senha
            <input
              type="password"
              required
              minLength={MINIMUM_PASSWORD_LENGTH}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit">Salvar nova senha</button>
          <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>
        </form>
      </main>
    )
  }

  return (
    <main className="center">
      <form className="card stack" onSubmit={handleRequest}>
        <h1>Recuperar senha</h1>
        <p className="hint">Digite seu e-mail para receber as instruções.</p>
        <label>
          E-mail
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit">Enviar código</button>
        <button type="button" className="secondary" onClick={onCancel}>Voltar</button>
      </form>
    </main>
  )
}
