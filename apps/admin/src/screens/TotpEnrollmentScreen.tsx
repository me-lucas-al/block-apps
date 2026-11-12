import { buildTotpUri } from '@block-apps/api'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTotpEnrollment } from '../hooks/useTotpEnrollment'

type Props = {
  readonly email: string
  readonly onEnrolled: () => void
}

export function TotpEnrollmentScreen({ email, onEnrolled }: Props) {
  const { secret, error: loadError, confirm } = useTotpEnrollment()
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!secret) return
    void QRCode.toDataURL(buildTotpUri(email, secret, 'Block Apps'), { margin: 1, width: 192 }).then(setQrImage)
  }, [email, secret])

  const handleSubmit = async (event: FormEvent) => {
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
      <form className="card stack" onSubmit={handleSubmit}>
        <h1>Ativar autenticação em duas etapas</h1>
        <p className="hint">Administradores precisam do MFA ativo. Escaneie o QR com seu app autenticador.</p>
        {loadError && <p className="error" role="alert">{loadError}</p>}
        {qrImage && <img src={qrImage} alt="QR code para o app autenticador" width={192} height={192} />}
        {secret && <p className="hint">Ou digite a chave: <code>{secret}</code></p>}
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
