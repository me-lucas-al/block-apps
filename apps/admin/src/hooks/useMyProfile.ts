import { useCallback, useEffect, useState } from 'react'
import type { MyProfile } from '../ports/ProfileGateway'
import { useServices } from '../services/ServicesContext'
import { describeFailure } from '../users/adminErrorMessage'

type ProfileState = {
  profile: MyProfile | null
  loading: boolean
  error: string | null
}

export function useMyProfile(sessionEmail: string) {
  const { profile: gateway } = useServices()
  const [state, setState] = useState<ProfileState>({ profile: null, loading: true, error: null })

  const reloadMyProfile = useCallback(async () => {
    try {
      setState({ profile: await gateway.load(), loading: false, error: null })
    } catch (failure) {
      setState({ profile: null, loading: false, error: describeFailure(failure) })
    }
  }, [gateway])

  useEffect(() => {
    void reloadMyProfile()
  }, [reloadMyProfile, sessionEmail])

  return { ...state, reloadMyProfile }
}
