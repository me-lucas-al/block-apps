import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useServices } from '../../services/ServicesContext'
import { colors } from '../../theme'

type Props = {
  readonly email: string
  readonly onConfirmed: () => void
  readonly onCancel: () => void
}

export function ConfirmSignUpStep({ email, onConfirmed, onCancel }: Props) {
  const { authenticator } = useServices()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setError(null)
      await authenticator.confirmSignUp?.(email, code.trim())
      onConfirmed()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao confirmar')
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
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar conta</Text>
      <Text style={styles.subtitle}>Digite o código enviado para {email}</Text>
      <TextField placeholder="Código de 6 dígitos" value={code} onChangeText={setCode} />
      {error && <Text style={styles.error}>{error}</Text>}
      {notice && <Text style={styles.subtitle}>{notice}</Text>}
      <Button label="Confirmar" onPress={() => void handleSubmit()} />
      <Button label="Reenviar código" variant="secondary" onPress={() => void resendConfirmationCode()} />
      <Button label="Voltar" variant="secondary" onPress={onCancel} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 12, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.muted, fontSize: 14 },
  error: { color: colors.danger },
})
