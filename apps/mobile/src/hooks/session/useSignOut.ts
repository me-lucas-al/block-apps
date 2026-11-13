import { SignOutUseCase } from '@block-apps/api'
import { useMemo } from 'react'
import { Alert } from 'react-native'
import { useServices } from '../../services/ServicesContext'

export function useSignOut(): () => Promise<void> {
  const { authenticator } = useServices()
  const signOutUseCase = useMemo(() => new SignOutUseCase(authenticator), [authenticator])

  return async function signOutAndWarnAboutRevocation() {
    const outcome = await signOutUseCase.signOut()
    if (!outcome.revokedOnServer) Alert.alert('Sessão encerrada', outcome.notice)
  }
}
