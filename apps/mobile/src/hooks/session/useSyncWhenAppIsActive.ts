import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useServices } from '../../services/ServicesContext'

export function useSyncWhenAppIsActive(signedInEmail: string | null): void {
  const { rulesSync, statusReporter, blocker } = useServices()

  useEffect(() => {
    if (!signedInEmail) return

    const syncRulesAndReportStatus = () => {
      blocker.markAppOpened()
      void rulesSync.sync().catch(() => {})
      void statusReporter.reportDeviceStatus().catch(() => {})
    }

    syncRulesAndReportStatus()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncRulesAndReportStatus()
    })
    return () => subscription.remove()
  }, [rulesSync, statusReporter, blocker, signedInEmail])
}
