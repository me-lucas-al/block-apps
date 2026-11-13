import { useEffect } from 'react'
import { useServices } from '../../services/ServicesContext'

export function useBackgroundRulesSync(signedInEmail: string | null, sessionLoading: boolean): void {
  const { rulesSyncScheduler } = useServices()

  useEffect(() => {
    if (sessionLoading) return
    const pendingChange = signedInEmail
      ? rulesSyncScheduler.scheduleRulesSync()
      : rulesSyncScheduler.cancelRulesSync()
    pendingChange.catch(() => {})
  }, [rulesSyncScheduler, signedInEmail, sessionLoading])
}
