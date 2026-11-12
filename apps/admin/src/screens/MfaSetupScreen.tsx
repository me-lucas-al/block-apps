import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'

type Props = {
  readonly onCompleted: () => void
  readonly onCancel: () => void
}

export function MfaSetupScreen({ onCompleted, onCancel }: Props) {
  const { authenticator } = useServices()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.respondToMfaSetup?.(code.trim())
      onCompleted()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao vincular autenticador.')
    }
  }

  return (
    <main className="center">
      <form className="card stack" onSubmit={handleSubmit}>
        <h1>Configuração obrigatória de MFA</h1>
        <p className="hint">Administradores devem ter autenticação em duas etapas ativada.</p>
        <p className="hint">Insira o código do seu aplicativo autenticador para confirmar.</p>
        <label>
          Código de verificação
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
        <button type="submit">Ativar MFA</button>
        <button type="button" className="secondary" onClick={onCancel}>
          Voltar ao login
        </button>
      </form>
    </main>
  )
}
