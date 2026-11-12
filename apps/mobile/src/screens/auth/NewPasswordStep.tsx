import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useServices } from '../../services/ServicesContext'
import { colors } from '../../theme'

type Props = {
  readonly onCompleted: () => void
}

export function NewPasswordStep({ onCompleted }: Props) {
  const { authenticator } = useServices()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setError(null)
      await authenticator.respondToNewPassword?.(password)
      onCompleted()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao redefinir senha')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova senha</Text>
      <Text style={styles.subtitle}>Defina uma nova senha para sua conta.</Text>
      <TextField placeholder="Nova senha" secureTextEntry value={password} onChangeText={setPassword} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Salvar nova senha" onPress={() => void handleSubmit()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 12, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.muted, fontSize: 14 },
  error: { color: colors.danger },
})
