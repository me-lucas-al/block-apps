import { loginStepFor, type LoginStep } from '@block-apps/api'
import { useState } from 'react'
import { launchMobileGoogleAuth } from '../../adapters/auth/mobileGoogleAuth'
import { useServices } from '../../services/ServicesContext'

export type AuthStep = 'login' | 'confirm_signup' | 'new_password' | 'totp' | 'forgot_password'

const MFA_SETUP_UNSUPPORTED_MESSAGE =
  'Configure a autenticação em duas etapas pelo painel de administração antes de entrar.'

const STEP_AFTER_LOGIN: Readonly<Record<Exclude<LoginStep, 'mfa_setup'>, AuthStep>> = {
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
  const { authenticator } = useServices()
  const [step, setStep] = useState<AuthStep>('login')
  const [error, setError] = useState<string | null>(null)

  const submitCredentials = async (email: string, password: string) => {
    try {
      setError(null)
      const loginStep = loginStepFor(await authenticator.signInWithPassword(email, password))
      if (loginStep === 'mfa_setup') setError(MFA_SETUP_UNSUPPORTED_MESSAGE)
      else setStep(STEP_AFTER_LOGIN[loginStep])
    } catch (failure) {
      setError(describeFailure(failure, 'Erro ao entrar'))
    }
  }

  const registerAccount = async (email: string, password: string) => {
    try {
      setError(null)
      await authenticator.signUpWithPassword(email, password)
      setStep('confirm_signup')
    } catch (failure) {
      setError(describeFailure(failure, 'Erro ao cadastrar'))
    }
  }

  const startGoogleSignIn = async () => {
    try {
      setError(null)
      await launchMobileGoogleAuth(authenticator)
    } catch (failure) {
      setError(describeFailure(failure, 'Erro no login Google'))
    }
  }

  const returnToLogin = () => setStep('login')
  const openPasswordReset = () => setStep('forgot_password')

  return {
    step,
    error,
    submitCredentials,
    registerAccount,
    startGoogleSignIn,
    returnToLogin,
    openPasswordReset,
  }
}
