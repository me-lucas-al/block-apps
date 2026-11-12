import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../../services/ServicesContext'

type Props = {
  readonly onCompleted: () => void
}

export function TotpForm({ onCompleted }: Props) {
  const { authenticator } = useServices()
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await authenticator.respondToMfaCode?.(totpCode.trim())
      onCompleted()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Código inválido')
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <h2>Autenticação em duas etapas</h2>
      <p>Digite o código gerado no seu aplicativo autenticador.</p>
      <input
        type="text"
        placeholder="Código de 6 dígitos"
        value={totpCode}
        required
        maxLength={6}
        onChange={(e) => setTotpCode(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Confirmar código</button>
    </form>
  )
}
