import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import { useServices } from '../services/ServicesContext'
import { colors } from '../theme'

type AuthAction = 'signInWithPassword' | 'signUpWithPassword'

export function LoginScreen() {
  const { authenticator } = useServices()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = async (action: AuthAction) => {
    try {
      setError(null)
      await authenticator[action](email.trim(), password)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro inesperado')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
      <TextField placeholder="E-mail" keyboardType="email-address" value={email}
        onChangeText={setEmail} />
      <TextField placeholder="Senha" secureTextEntry value={password}
        onChangeText={setPassword} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Entrar" onPress={() => void submit('signInWithPassword')} />
      <Button label="Criar conta" variant="secondary" onPress={() => void submit('signUpWithPassword')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 12, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  error: { color: colors.danger },
})
