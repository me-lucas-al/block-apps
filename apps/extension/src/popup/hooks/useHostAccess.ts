import { useCallback, useEffect, useState } from 'react'
import { useServices } from '../services/ServicesContext'

export type HostAccessState = {
  readonly granted: boolean | null
  readonly requestAccess: () => Promise<void>
}

export function useHostAccess(): HostAccessState {
  const { hostAccess } = useServices()
  const [granted, setGranted] = useState<boolean | null>(null)

  useEffect(() => {
    void hostAccess.isGranted().then(setGranted)
  }, [hostAccess])

  const requestAccess = useCallback(async () => {
    setGranted(await hostAccess.requestAccess())
  }, [hostAccess])

  return { granted, requestAccess }
}
