import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useServices } from '../../services/ServicesContext'
import { colors } from '../../theme'

type Props = {
  readonly initialEmail: string
  readonly onCancel: () => void
  readonly onCompleted: () => void
}

export function ForgotPasswordStep({ initialEmail, onCancel, onCompleted }: Props) {
  const { authenticator } = useServices()
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestCode = async () => {
    try {
      setError(null)
      await authenticator.requestPasswordReset?.(email.trim())
      setCodeSent(true)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao solicitar código')
    }
  }

  const handleConfirmReset = async () => {
    try {
      setError(null)
      await authenticator.confirmPasswordReset?.(email.trim(), code.trim(), newPassword)
      onCompleted()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao redefinir senha')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redefinir senha</Text>
      {!codeSent ? (
        <>
          <TextField placeholder="E-mail" value={email} onChangeText={setEmail} />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button label="Enviar código" onPress={() => void handleRequestCode()} />
          <Button label="Voltar" variant="secondary" onPress={onCancel} />
        </>
      ) : (
        <>
          <TextField placeholder="Código recebido" value={code} onChangeText={setCode} />
          <TextField placeholder="Nova senha" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button label="Salvar senha" onPress={() => void handleConfirmReset()} />
          <Button label="Voltar" variant="secondary" onPress={onCancel} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 12, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  error: { color: colors.danger },
})
