import { useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { ProtectionStatus } from '../components/protection/ProtectionStatus'
import { AppRuleItem } from '../components/rules/apps/AppRuleItem'
import { Button } from '../components/ui/Button'
import { useAppCatalog } from '../hooks/rules/useAppCatalog'
import { useBlockRules } from '../hooks/rules/useBlockRules'
import { describeRuleTarget } from '../rules/describeRuleTarget'
import { useInstalledApps } from '../hooks/device/useInstalledApps'
import { useServices } from '../services/ServicesContext'
import { colors } from '../theme'
import { AddRuleScreen } from './AddRuleScreen'

type HomeScreenProps = {
  email: string
}

export function HomeScreen({ email }: HomeScreenProps) {
  const { authenticator } = useServices()
  const { rules, pendingChanges, error, create, requestRemoval, cancelChange } = useBlockRules()
  const apps = useInstalledApps()
  const { labelFor } = useAppCatalog(apps)
  const [adding, setAdding] = useState(false)

  if (adding) {
    return (
      <AddRuleScreen installedApps={apps} onSubmit={create} onCancel={() => setAdding(false)} />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.email}>{email}</Text>
        <Button label="Sair" variant="secondary" onPress={() => void authenticator.signOut()} />
      </View>
      <ProtectionStatus />
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={rules}
        keyExtractor={(rule) => rule.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum app ou palavra bloqueada ainda.</Text>}
        renderItem={({ item }) => (
          <AppRuleItem
            rule={item}
            label={describeRuleTarget(item, labelFor)}
            pendingChange={pendingChanges.find((change) => change.ruleId === item.id)}
            onRemove={(id) => void requestRemoval(id)}
            onCancel={(id) => void cancelChange(id)}
          />
        )}
      />
      <Button label="Bloquear app ou palavra" onPress={() => setAdding(true)} />
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
