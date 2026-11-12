import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { launchMobileGoogleAuth } from '../adapters/auth/mobileGoogleAuth'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import { useServices } from '../services/ServicesContext'
import { colors } from '../theme'
import { ConfirmSignUpStep } from './auth/ConfirmSignUpStep'
import { ForgotPasswordStep } from './auth/ForgotPasswordStep'
import { NewPasswordStep } from './auth/NewPasswordStep'
import { TotpStep } from './auth/TotpStep'

type AuthStep = 'login' | 'confirm_signup' | 'new_password' | 'totp' | 'forgot_password'

export function LoginScreen() {
  const { authenticator } = useServices()
  const [step, setStep] = useState<AuthStep>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    try {
      setError(null)
      await authenticator.signInWithPassword(email.trim(), password)
    } catch (failure) {
      const msg = failure instanceof Error ? failure.message : 'Erro ao entrar'
      if (msg.includes('NEW_PASSWORD_REQUIRED')) setStep('new_password')
      else if (msg.includes('MFA_REQUIRED')) setStep('totp')
      else setError(msg)
    }
  }

  const handleSignUp = async () => {
    try {
      setError(null)
      await authenticator.signUpWithPassword(email.trim(), password)
      setStep('confirm_signup')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro ao cadastrar')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      await launchMobileGoogleAuth(authenticator)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro no login Google')
    }
  }

  if (step === 'confirm_signup') {
    return <ConfirmSignUpStep email={email} onConfirmed={() => setStep('login')} onCancel={() => setStep('login')} />
  }
  if (step === 'new_password') return <NewPasswordStep onCompleted={() => setStep('login')} />
  if (step === 'totp') return <TotpStep onCompleted={() => setStep('login')} />
  if (step === 'forgot_password') {
    return <ForgotPasswordStep initialEmail={email} onCancel={() => setStep('login')} onCompleted={() => setStep('login')} />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
      <TextField placeholder="E-mail" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextField placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Entrar" onPress={() => void handleSignIn()} />
      <Button label="Criar conta" variant="secondary" onPress={() => void handleSignUp()} />
      <Button label="Entrar com Google" variant="secondary" onPress={() => void handleGoogleSignIn()} />
      <Button label="Esqueci a senha" variant="secondary" onPress={() => setStep('forgot_password')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 12, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  error: { color: colors.danger },
})
