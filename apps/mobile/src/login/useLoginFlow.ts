import { useState } from 'react'
import { launchMobileGoogleAuth } from '../adapters/auth/mobileGoogleAuth'
import { useServices } from '../services/ServicesContext'
import { describeNextLoginStep, type LoginStep } from './describeNextLoginStep'

const LOGIN_STEP: LoginStep = { step: 'login', notice: null }

export function useLoginFlow() {
  const { authenticator } = useServices()
  const [loginStep, setLoginStep] = useState<LoginStep>(LOGIN_STEP)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitLoginForm = async () => {
    setError(null)
    try {
      const signInResult = await authenticator.signInWithPassword(email.trim(), password)
      const nextStep = describeNextLoginStep(signInResult)
      if (nextStep.step === 'login') setError(nextStep.notice)
      else setLoginStep(nextStep)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro ao entrar')
    }
  }

  const startAccountSignUp = async () => {
    setError(null)
    try {
      await authenticator.signUpWithPassword(email.trim(), password)
      setLoginStep({ step: 'confirm_signup' })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro ao cadastrar')
    }
  }

  const startGoogleSignIn = async () => {
    setError(null)
    try {
      await launchMobileGoogleAuth(authenticator)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro no login Google')
    }
  }

  const returnToLogin = () => setLoginStep(LOGIN_STEP)
  const openPasswordReset = () => setLoginStep({ step: 'forgot_password' })

  return {
    loginStep,
    email,
    password,
    error,
    setEmail,
    setPassword,
    submitLoginForm,
    startAccountSignUp,
    startGoogleSignIn,
    returnToLogin,
    openPasswordReset,
  }
}
