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
    if (!signedInEmail) {
      setSyncFailure(null)
      return
    }
    let isStillActive = true

    const markOpenedThenSyncRules = async () => {
      try {
        await blocker.markAppOpened()
        await rulesSync.sync()
        if (isStillActive) setSyncFailure(null)
      } catch (failure: unknown) {
        if (isStillActive) setSyncFailure(describeAppFailure(failure))
      }
    }

    const syncRulesAndReportStatus = () => {
      void markOpenedThenSyncRules()
      void statusReporter.reportDeviceStatus().catch(() => {})
    }

    syncRulesAndReportStatus()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncRulesAndReportStatus()
    })
    return () => {
      isStillActive = false
      subscription.remove()
    }
  }, [rulesSync, statusReporter, blocker, signedInEmail])

  return { syncFailure }
}
