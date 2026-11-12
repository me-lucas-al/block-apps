import { useState } from 'react'
import { AppShell, type Page } from './components/layout/AppShell'
import { useMyProfile } from './hooks/useMyProfile'
import { useSessionEmail } from './hooks/useSessionEmail'
import { ForbiddenScreen } from './screens/ForbiddenScreen'
import { LoginScreen } from './screens/LoginScreen'
import { MyAccountScreen } from './screens/MyAccountScreen'
import { PasswordChangeScreen } from './screens/PasswordChangeScreen'
import { ProfileErrorScreen } from './screens/ProfileErrorScreen'
import { TotpEnrollmentScreen } from './screens/TotpEnrollmentScreen'
import { UsersScreen } from './screens/UsersScreen'

function SignedInArea({ email }: { email: string }) {
  const { profile, loading, error, mfaRequired, reloadMyProfile } = useMyProfile(email)
  const [page, setPage] = useState<Page>('users')

  if (loading) return <p className="hint center">Carregando…</p>
  if (mfaRequired) return <TotpEnrollmentScreen email={email} onEnrolled={reloadMyProfile} />
  if (error || !profile) return <ProfileErrorScreen message={error ?? 'Perfil não encontrado.'} />
  if (profile.mustChangePassword) return <PasswordChangeScreen onPasswordChanged={reloadMyProfile} />
  if (profile.role !== 'admin') return <ForbiddenScreen email={profile.email} />

  return (
    <AppShell email={profile.email} page={page} onNavigate={setPage}>
      {page === 'users' ? (
        <UsersScreen currentUserId={profile.id} />
      ) : (
        <MyAccountScreen profile={profile} onChanged={reloadMyProfile} />
      )}
    </AppShell>
  )
}

export function App() {
  const { email, loading } = useSessionEmail()

  if (loading) return <p className="hint center">Carregando…</p>
  if (!email) return <LoginScreen />
  return <SignedInArea email={email} />
}
