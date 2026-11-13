import { loginStepFor, type LoginStep } from '@block-apps/api'
import { useState } from 'react'
import { useServices } from '../services/ServicesContext'

export type AuthView = 'login' | 'confirm_signup' | 'new_password' | 'totp' | 'forgot_password'

const MFA_SETUP_UNSUPPORTED_MESSAGE =
  'Configure a autenticação em duas etapas pelo painel de administração antes de entrar.'

const VIEW_AFTER_STEP: Readonly<Record<Exclude<LoginStep, 'mfa_setup'>, AuthView>> = {
  signed_in: 'login',
  new_password: 'new_password',
  totp: 'totp',
  reset_password: 'forgot_password',
  confirm_signup: 'confirm_signup',
}

function describeFailure(failure: unknown, fallbackMessage: string): string {
  return failure instanceof Error ? failure.message : fallbackMessage
}

export function useLoginFlow() {
  const { authenticator, googleSignIn } = useServices()
  const [view, setView] = useState<AuthView>('login')
  const [error, setError] = useState<string | null>(null)

  const submitCredentials = async (email: string, password: string) => {
    try {
      setError(null)
      const step = loginStepFor(await authenticator.signInWithPassword(email, password))
      if (step === 'mfa_setup') setError(MFA_SETUP_UNSUPPORTED_MESSAGE)
      else setView(VIEW_AFTER_STEP[step])
    } catch (failure) {
      setError(describeFailure(failure, 'Erro ao entrar'))
    }
  }

  const registerAccount = async (email: string, password: string) => {
    try {
      setError(null)
      await authenticator.signUpWithPassword(email, password)
      setView('confirm_signup')
    } catch (failure) {
      setError(describeFailure(failure, 'Erro ao cadastrar'))
    }
  }

  const startGoogleSignIn = async () => {
    try {
      setError(null)
      await googleSignIn.requestGoogleSignIn()
    } catch (failure) {
      setError(describeFailure(failure, 'Erro no login Google'))
    }
  }

  const returnToLogin = () => setView('login')
  const openPasswordReset = () => setView('forgot_password')

  return {
    view,
    error,
    submitCredentials,
    registerAccount,
    startGoogleSignIn,
    returnToLogin,
    openPasswordReset,
  }
}
