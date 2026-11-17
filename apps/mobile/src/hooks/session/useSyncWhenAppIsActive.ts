import { useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { describeAppFailure } from '../../errors/describeAppFailure'
import { useServices } from '../../services/ServicesContext'

function describeFailureOrNull(failure: unknown): string {
  return describeAppFailure(failure)
}

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
    let latestRun = 0

    const markOpenedThenSyncRules = async () => {
      latestRun += 1
      const thisRun = latestRun
      const markFailure = await blocker.markAppOpened().then(() => null, describeFailureOrNull)
      const syncRulesFailure = await rulesSync.sync().then(() => null, describeFailureOrNull)
      if (!isStillActive || thisRun !== latestRun) return
      setSyncFailure(markFailure ?? syncRulesFailure)
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
