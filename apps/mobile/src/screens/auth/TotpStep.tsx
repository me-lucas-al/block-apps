import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useServices } from '../../services/ServicesContext'
import { colors } from '../../theme'

type Props = {
  readonly onCompleted: () => void
}

export function TotpStep({ onCompleted }: Props) {
  const { authenticator } = useServices()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setError(null)
      await authenticator.respondToMfaCode?.(code.trim())
      onCompleted()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Código inválido')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Autenticação em duas etapas</Text>
      <Text style={styles.subtitle}>Digite o código gerado no seu autenticador.</Text>
      <TextField placeholder="Código de 6 dígitos" value={code} onChangeText={setCode} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Confirmar" onPress={() => void handleSubmit()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 12, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.muted, fontSize: 14 },
  error: { color: colors.danger },
})
