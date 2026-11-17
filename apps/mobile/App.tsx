import 'react-native-url-polyfill/auto'
import { StatusBar } from 'expo-status-bar'
import { useMemo } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native'
import { useBackgroundRulesSync } from './src/hooks/session/useBackgroundRulesSync'
import { useSessionEmail } from './src/hooks/session/useSessionEmail'
import { useRequestAuthorizationOnFirstOpen } from './src/hooks/session/useRequestAuthorizationOnFirstOpen'
import { useSyncWhenAppIsActive } from './src/hooks/session/useSyncWhenAppIsActive'
import { HomeScreen } from './src/screens/HomeScreen'
import { LoginScreen } from './src/screens/LoginScreen'
import { ServicesProvider } from './src/services/ServicesContext'
import { createServices } from './src/services/createServices'
import { colors } from './src/theme'

function Root() {
  const { email, loading } = useSessionEmail()
  const { syncFailure } = useSyncWhenAppIsActive(email)
  const { authorizationFailure } = useRequestAuthorizationOnFirstOpen(email)
  useBackgroundRulesSync(email, loading)

  if (loading) return <ActivityIndicator style={styles.loading} />
  if (!email) return <LoginScreen />
  return <HomeScreen email={email} syncFailure={syncFailure ?? authorizationFailure} />
}

export default function App() {
  const services = useMemo(() => createServices(), [])

  return (
    <ServicesProvider services={services}>
      <SafeAreaView style={styles.container}>
        <Root />
        <StatusBar style="auto" />
      </SafeAreaView>
    </ServicesProvider>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1 },
})
