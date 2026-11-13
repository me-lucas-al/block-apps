import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../../services/ServicesContext'

type Props = {
  readonly email: string
  readonly onConfirmed: () => void
  readonly onCancel: () => void
}

export function ConfirmSignUpForm({ email, onConfirmed, onCancel }: Props) {
  const { authenticator } = useServices()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.confirmSignUp?.(email, code.trim())
      onConfirmed()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha na confirmação')
    }
  }

  const resendConfirmationCode = async () => {
    try {
      setError(null)
      setNotice(null)
      await authenticator.resendConfirmationCode?.(email)
      setNotice(`Código reenviado para ${email}.`)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao reenviar o código')
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <h2>Confirmar conta</h2>
      <p>Digite o código enviado para {email}</p>
      <input
        type="text"
        placeholder="Código de confirmação"
        value={code}
        required
        onChange={(e) => setCode(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      {notice && <p className="hint">{notice}</p>}
      <div className="row">
        <button type="submit">Confirmar</button>
        <button type="button" className="secondary" onClick={() => void resendConfirmationCode()}>
          Reenviar código
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Voltar
        </button>
      </div>
    </form>
  )
}
