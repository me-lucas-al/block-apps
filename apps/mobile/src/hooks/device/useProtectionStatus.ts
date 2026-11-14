import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import type { ProtectionCheck } from '../../ports/protection/ProtectionPort'
import { useServices } from '../../services/ServicesContext'

export function useProtectionStatus(): readonly ProtectionCheck[] {
  const { protection } = useServices()
  const [checks, setChecks] = useState<readonly ProtectionCheck[]>([])

  const reloadChecks = useCallback(() => {
    setChecks(protection.listChecks())
  }, [protection])

  useEffect(() => {
    reloadChecks()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') reloadChecks()
    })
    return () => subscription.remove()
  }, [reloadChecks])

  return checks
}
