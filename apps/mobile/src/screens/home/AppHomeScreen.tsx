import { useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { HomeHeader } from '../../components/home/HomeHeader'
import { ProtectionStatus } from '../../components/protection/ProtectionStatus'
import { AppRuleItem } from '../../components/rules/apps/AppRuleItem'
import { Button } from '../../components/ui/Button'
import { useInstalledApps } from '../../hooks/device/useInstalledApps'
import { useAppCatalog } from '../../hooks/rules/useAppCatalog'
import { useAppRules } from '../../hooks/rules/useAppRules'
import { colors } from '../../theme'
import { AddRuleScreen } from '../AddRuleScreen'

type AppHomeScreenProps = {
  email: string
}

export function AppHomeScreen({ email }: AppHomeScreenProps) {
  const { rules, pendingChanges, error, create, requestRemoval, cancelChange } = useAppRules()
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
      <HomeHeader email={email} />
      <ProtectionStatus />
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={rules}
        keyExtractor={(rule) => rule.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum app bloqueado ainda.</Text>}
        renderItem={({ item }) => (
          <AppRuleItem
            rule={item}
            label={labelFor(item.target)}
            pendingChange={pendingChanges.find((change) => change.ruleId === item.id)}
            onRemove={(id) => void requestRemoval(id)}
            onCancel={(id) => void cancelChange(id)}
          />
        )}
      />
      <Button label="Bloquear um app" onPress={() => setAdding(true)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 20 },
  error: { color: colors.danger },
  empty: { color: colors.muted },
})
