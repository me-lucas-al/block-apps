import { useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { describeAppFailure } from '../../errors/describeAppFailure'
import { useServices } from '../../services/ServicesContext'

export function useSyncWhenAppIsActive(signedInEmail: string | null): {
  syncFailure: string | null
} {
  const { rulesSync, statusReporter, blocker } = useServices()
  const [syncFailure, setSyncFailure] = useState<string | null>(null)

  useEffect(() => {
    if (!signedInEmail) return

    const syncRulesAndReportStatus = () => {
      blocker.markAppOpened()
      void rulesSync
        .sync()
        .then(() => setSyncFailure(null))
        .catch((failure: unknown) => setSyncFailure(describeAppFailure(failure)))
      void statusReporter.reportDeviceStatus().catch(() => {})
    }

    syncRulesAndReportStatus()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncRulesAndReportStatus()
    })
    return () => subscription.remove()
  }, [rulesSync, statusReporter, blocker, signedInEmail])

  return { syncFailure }
}
