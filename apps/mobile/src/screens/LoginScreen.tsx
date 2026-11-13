import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import { useLoginFlow } from '../hooks/session/useLoginFlow'
import { colors } from '../theme'
import { ConfirmSignUpStep } from './auth/ConfirmSignUpStep'
import { ForgotPasswordStep } from './auth/ForgotPasswordStep'
import { NewPasswordStep } from './auth/NewPasswordStep'
import { TotpStep } from './auth/TotpStep'

export function LoginScreen() {
  const loginFlow = useLoginFlow()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { step, error, returnToLogin } = loginFlow

  if (step === 'confirm_signup') {
    return <ConfirmSignUpStep email={email.trim()} onConfirmed={returnToLogin} onCancel={returnToLogin} />
  }
  if (step === 'new_password') return <NewPasswordStep onCompleted={returnToLogin} />
  if (step === 'totp') return <TotpStep onCompleted={returnToLogin} />
  if (step === 'forgot_password') {
    return <ForgotPasswordStep initialEmail={email} onCancel={returnToLogin} onCompleted={returnToLogin} />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
      <TextField placeholder="E-mail" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextField placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Entrar" onPress={() => void loginFlow.submitCredentials(email.trim(), password)} />
      <Button label="Criar conta" variant="secondary" onPress={() => void loginFlow.registerAccount(email.trim(), password)} />
      <Button label="Entrar com Google" variant="secondary" onPress={() => void loginFlow.startGoogleSignIn()} />
      <Button label="Esqueci a senha" variant="secondary" onPress={loginFlow.openPasswordReset} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 12, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  error: { color: colors.danger },
})
