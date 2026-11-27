import { buildTotpUri } from '@block-apps/api'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

const AUTHENTICATOR_ISSUER = 'Block Apps'

type Props = {
  readonly email: string
  readonly secret: string
}

export function TotpQrCode({ email, secret }: Props) {
  const [qrImage, setQrImage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setQrImage(null)
    const authenticatorUri = buildTotpUri(email, secret, AUTHENTICATOR_ISSUER)
    QRCode.toDataURL(authenticatorUri, { margin: 1, width: 192 }).then(
      (image) => {
        if (!cancelled) setQrImage(image)
      },
      () => undefined,
    )
    return () => {
      cancelled = true
    }
  }, [email, secret])

  return (
    <>
      {qrImage && <img src={qrImage} alt="QR code para o app autenticador" width={192} height={192} />}
      <p className="hint">Ou digite a chave: <code>{secret}</code></p>
    </>
  )
}
