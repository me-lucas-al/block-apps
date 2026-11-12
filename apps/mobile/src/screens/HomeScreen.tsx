import { useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { ProtectionStatus } from '../components/protection/ProtectionStatus'
import { AppRuleItem } from '../components/rules/AppRuleItem'
import { Button } from '../components/ui/Button'
import { useAppRules } from '../hooks/useAppRules'
import { useInstalledApps } from '../hooks/useInstalledApps'
import { useServices } from '../services/ServicesContext'
import { colors } from '../theme'
import { AddRuleScreen } from './AddRuleScreen'

type HomeScreenProps = {
  email: string
}

export function HomeScreen({ email }: HomeScreenProps) {
  const { auth } = useServices()
  const { rules, error, create, remove } = useAppRules()
  const apps = useInstalledApps()
  const [adding, setAdding] = useState(false)

  if (adding) {
    return <AddRuleScreen apps={apps} onSubmit={create} onCancel={() => setAdding(false)} />
  }

  const labelFor = (packageName: string) =>
    apps.find((app) => app.packageName === packageName)?.label ?? packageName

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.email}>{email}</Text>
        <Button label="Sair" variant="secondary" onPress={() => void auth.signOut()} />
      </View>
      <ProtectionStatus />
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={rules}
        keyExtractor={(rule) => rule.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum app bloqueado ainda.</Text>}
        renderItem={({ item }) => (
          <AppRuleItem rule={item} label={labelFor(item.target)} onRemove={(id) => void remove(id)} />
        )}
      />
      <Button label="Bloquear um app" onPress={() => setAdding(true)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  email: { color: colors.muted },
  error: { color: colors.danger },
  empty: { color: colors.muted },
})
