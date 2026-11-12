import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'

type Props = {
  readonly onCompleted: () => void
  readonly onCancel: () => void
}

export function TotpScreen({ onCompleted, onCancel }: Props) {
  const { authenticator } = useServices()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.respondToMfaCode?.(code.trim())
      onCompleted()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Código de verificação incorreto.')
    }
  }

  return (
    <main className="center">
      <form className="card stack" onSubmit={handleSubmit}>
        <h1>Autenticação em duas etapas</h1>
        <p className="hint">Digite o código de 6 dígitos gerado pelo seu app autenticador.</p>
        <label>
          Código TOTP
          <input
            type="text"
            required
            maxLength={6}
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit">Verificar e entrar</button>
        <button type="button" className="secondary" onClick={onCancel}>
          Voltar ao login
        </button>
      </form>
    </main>
  )
}
