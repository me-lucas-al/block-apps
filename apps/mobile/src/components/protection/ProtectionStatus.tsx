import { StyleSheet, View } from 'react-native'
import { useProtectionStatus } from '../../hooks/device/useProtectionStatus'
import { colors } from '../../theme'
import { ProtectionRow } from './ProtectionRow'

export function ProtectionStatus() {
  const checks = useProtectionStatus()

  if (checks.every((check) => check.active)) return null

  return (
    <View style={styles.card}>
      {checks.map((check) => (
        <ProtectionRow
          key={check.id}
          title={check.title}
          description={check.description}
          active={check.active}
          actionLabel={check.actionLabel}
          onAction={check.performAction}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.warningBackground,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
})
