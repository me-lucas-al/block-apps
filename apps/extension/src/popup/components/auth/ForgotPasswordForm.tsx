import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../../services/ServicesContext'

type Props = {
  readonly initialEmail: string
  readonly onCancel: () => void
  readonly onCompleted: () => void
}

export function ForgotPasswordForm({ initialEmail, onCancel, onCompleted }: Props) {
  const { authenticator } = useServices()
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestCode = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.requestPasswordReset?.(email.trim())
      setCodeSent(true)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao solicitar código')
    }
  }

  const handleConfirmReset = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.confirmPasswordReset?.(email.trim(), code.trim(), newPassword)
      onCompleted()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao redefinir senha')
    }
  }

  if (codeSent) {
    return (
      <form className="stack" onSubmit={handleConfirmReset}>
        <h2>Redefinir senha</h2>
        <input type="text" placeholder="Código recebido" value={code} required onChange={(e) => setCode(e.target.value)} />
        <input type="password" placeholder="Nova senha" value={newPassword} required minLength={8} onChange={(e) => setNewPassword(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button type="submit">Salvar senha</button>
          <button type="button" className="secondary" onClick={onCancel}>Voltar</button>
        </div>
      </form>
    )
  }

  return (
    <form className="stack" onSubmit={handleRequestCode}>
      <h2>Esqueci a senha</h2>
      <input type="email" placeholder="E-mail" value={email} required onChange={(e) => setEmail(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="submit">Enviar código</button>
        <button type="button" className="secondary" onClick={onCancel}>Voltar</button>
      </div>
    </form>
  )
}
