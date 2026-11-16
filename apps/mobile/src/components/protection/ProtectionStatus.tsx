import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { describeAppFailure } from '../../errors/describeAppFailure'
import type { ProtectionCheck } from '../../ports/protection/ProtectionPort'
import { useProtectionStatus } from '../../hooks/device/useProtectionStatus'
import { colors } from '../../theme'
import { ProtectionRow } from './ProtectionRow'

export function ProtectionStatus() {
  const checks = useProtectionStatus()
  const [actionFailure, setActionFailure] = useState<string | null>(null)

  const performCheckAction = async (check: ProtectionCheck) => {
    setActionFailure(null)
    try {
      await check.performAction()
    } catch (failure: unknown) {
      setActionFailure(describeAppFailure(failure))
    }
  }

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
          onAction={() => void performCheckAction(check)}
        />
      ))}
      {actionFailure && <Text style={styles.failure}>{actionFailure}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  failure: { color: colors.danger, fontSize: 12 },
  card: {
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.warningBackground,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
})
