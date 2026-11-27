import { useState } from 'react'
import type { FormEvent } from 'react'
import { TotpQrCode } from '../components/totp/TotpQrCode'
import { useTotpEnrollment } from '../hooks/useTotpEnrollment'

type Props = {
  readonly email: string
  readonly onEnrolled: () => void
}

export function TotpEnrollmentScreen({ email, onEnrolled }: Props) {
  const { secret, error: loadError, confirm } = useTotpEnrollment()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitEnrollmentCode = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      await confirm(code.trim())
      onEnrolled()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Código incorreto.')
    }
  }

  return (
    <main className="center">
      <form className="card stack" onSubmit={submitEnrollmentCode}>
        <h1>Ativar autenticação em duas etapas</h1>
        <p className="hint">Administradores precisam do MFA ativo. Escaneie o QR com seu app autenticador.</p>
        {loadError && <p className="error" role="alert">{loadError}</p>}
        {secret && <TotpQrCode email={email} secret={secret} />}
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
        <button type="submit" disabled={!secret}>Ativar MFA</button>
      </form>
    </main>
  )
}
