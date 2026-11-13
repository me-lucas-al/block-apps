import { useEffect, useMemo, useState } from 'react'
import { useServices } from '../services/ServicesContext'
import { createHostAccessActions } from './createHostAccessActions'

export type HostAccessState = {
  readonly granted: boolean | null
  readonly requestAccess: () => Promise<void>
}

export function useHostAccess(): HostAccessState {
  const { hostAccess } = useServices()
  const [granted, setGranted] = useState<boolean | null>(null)
  const actions = useMemo(
    () => createHostAccessActions(hostAccess, setGranted),
    [hostAccess],
  )

  useEffect(() => {
    void actions.loadGrantedState()
  }, [actions])

  return { granted, requestAccess: actions.requestAccess }
}
