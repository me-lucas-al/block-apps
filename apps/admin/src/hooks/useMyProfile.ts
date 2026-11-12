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
  const { profile: profileGateway } = useServices()
  const [profileState, setProfileState] = useState<ProfileState>({
    profile: null,
    loading: true,
    error: null,
  })

  const reloadMyProfile = useCallback(async () => {
    try {
      setProfileState({ profile: await profileGateway.loadMyProfile(), loading: false, error: null })
    } catch (failure) {
      setProfileState({ profile: null, loading: false, error: describeFailure(failure) })
    }
  }, [profileGateway])

  useEffect(() => {
    void reloadMyProfile()
  }, [reloadMyProfile, sessionEmail])

  return { ...profileState, reloadMyProfile }
}
