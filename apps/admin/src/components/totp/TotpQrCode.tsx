import { buildTotpUri } from '@block-apps/api'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

type Props = {
  readonly email: string
  readonly secret: string
}

export function TotpQrCode({ email, secret }: Props) {
  const [qrImage, setQrImage] = useState<string | null>(null)

  useEffect(() => {
    void QRCode.toDataURL(buildTotpUri(email, secret, 'Block Apps'), { margin: 1, width: 192 }).then(setQrImage)
  }, [email, secret])

  return (
    <>
      {qrImage && <img src={qrImage} alt="QR code para o app autenticador" width={192} height={192} />}
      <p className="hint">Ou digite a chave: <code>{secret}</code></p>
    </>
  )
}
