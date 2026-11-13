import { useEffect } from 'react'
import { useServices } from '../../services/ServicesContext'

export function useBackgroundRulesSync(signedInEmail: string | null, sessionLoading: boolean): void {
  const { rulesSyncScheduler } = useServices()

  useEffect(() => {
    if (sessionLoading || !signedInEmail) return
    rulesSyncScheduler.scheduleRulesSync().catch(() => {})
  }, [rulesSyncScheduler, signedInEmail, sessionLoading])
}
