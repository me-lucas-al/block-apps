import { useEffect } from 'react'
import { useServices } from '../services/ServicesContext'

export function useRefreshRulesWhenSignedIn(email: string | null): void {
  const { background } = useServices()

  useEffect(() => {
    if (!email) return
    background.notifyRulesChanged()
  }, [background, email])
}
