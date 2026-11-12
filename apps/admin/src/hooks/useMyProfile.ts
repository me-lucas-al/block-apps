import { useCallback, useEffect, useState } from 'react'
import type { MyProfile } from '../ports/ProfileGateway'
import { useServices } from '../services/ServicesContext'
import { describeFailure, isMfaRequiredFailure } from '../users/adminErrorMessage'

type ProfileState = {
  profile: MyProfile | null
  loading: boolean
  error: string | null
  mfaRequired: boolean
}

export function useMyProfile(sessionEmail: string) {
  const { profile: profileGateway } = useServices()
  const [profileState, setProfileState] = useState<ProfileState>({
    profile: null,
    loading: true,
    error: null,
    mfaRequired: false,
  })

  const reloadMyProfile = useCallback(async () => {
    try {
      setProfileState({
        profile: await profileGateway.loadMyProfile(),
        loading: false,
        error: null,
        mfaRequired: false,
      })
    } catch (failure) {
      setProfileState({
        profile: null,
        loading: false,
        error: describeFailure(failure),
        mfaRequired: isMfaRequiredFailure(failure),
      })
    }
  }, [profileGateway])

  useEffect(() => {
    void reloadMyProfile()
  }, [reloadMyProfile, sessionEmail])

  return { ...profileState, reloadMyProfile }
}
