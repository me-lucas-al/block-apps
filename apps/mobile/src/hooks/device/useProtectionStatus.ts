import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { useServices } from '../../services/ServicesContext'

export type ProtectionStatus = {
  accessibilityEnabled: boolean
  deviceAdminActive: boolean
}

export function useProtectionStatus() {
  const { blocker } = useServices()
  const [status, setStatus] = useState<ProtectionStatus>({
    accessibilityEnabled: false,
    deviceAdminActive: false,
  })

  const refresh = useCallback(() => {
    setStatus({
      accessibilityEnabled: blocker.isAccessibilityEnabled(),
      deviceAdminActive: blocker.isDeviceAdminActive(),
    })
  }, [blocker])

  useEffect(() => {
    refresh()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh()
    })
    return () => subscription.remove()
  }, [refresh])

  return {
    status,
    openAccessibilitySettings: () => blocker.openAccessibilitySettings(),
    requestDeviceAdmin: () => blocker.requestDeviceAdmin(),
  }
}
