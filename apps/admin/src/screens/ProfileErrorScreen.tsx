import { useSignOut } from '../hooks/useSignOut'

type ProfileErrorScreenProps = {
  message: string
}

export function ProfileErrorScreen({ message }: ProfileErrorScreenProps) {
  const signOut = useSignOut()

  return (
    <main className="center">
      <div className="card stack">
        <p className="error" role="alert">{message}</p>
        <button type="button" onClick={() => void signOut()}>Sair</button>
      </div>
    </main>
  )
}
