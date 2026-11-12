import { StyleSheet, View } from 'react-native'
import { useProtectionStatus } from '../../hooks/useProtectionStatus'
import { colors } from '../../theme'
import { ProtectionRow } from './ProtectionRow'

export function ProtectionStatus() {
  const { status, openAccessibilitySettings, requestDeviceAdmin } = useProtectionStatus()

  if (status.accessibilityEnabled && status.deviceAdminActive) return null

  return (
    <View style={styles.card}>
      <ProtectionRow
        title="Serviço de acessibilidade"
        description="Necessário para detectar e bloquear os apps."
        active={status.accessibilityEnabled}
        actionLabel="Ativar"
        onAction={openAccessibilitySettings}
      />
      <ProtectionRow
        title="Proteção contra desinstalação"
        description="Exige desativar o administrador antes de desinstalar."
        active={status.deviceAdminActive}
        actionLabel="Ativar"
        onAction={requestDeviceAdmin}
      />
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
