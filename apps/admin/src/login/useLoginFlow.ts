import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServices } from '../services/ServicesContext'
import { describeNextLoginStep, type LoginStep } from './describeNextLoginStep'

const LOGIN_STEP: LoginStep = { view: 'login', notice: null }

export function useLoginFlow() {
  const { authenticator } = useServices()
  const [step, setStep] = useState<LoginStep>(LOGIN_STEP)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitLoginForm = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      const signInResult = await authenticator.signInWithPassword(email.trim(), password)
      const nextStep = describeNextLoginStep(signInResult)
      if (nextStep.view === 'login') setError(nextStep.notice)
      else setStep(nextStep)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'E-mail ou senha incorretos.')
    }
  }

  const returnToLogin = () => setStep(LOGIN_STEP)
  const openPasswordReset = () => setStep({ view: 'reset_password' })

  return {
    step,
    email,
    password,
    error,
    setEmail,
    setPassword,
    submitLoginForm,
    returnToLogin,
    openPasswordReset,
  }
}
