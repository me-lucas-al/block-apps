import { useServices } from '../services/ServicesContext'

type ProfileErrorScreenProps = {
  message: string
}

export function ProfileErrorScreen({ message }: ProfileErrorScreenProps) {
  const { authenticator } = useServices()

  return (
    <main className="center">
      <div className="card stack">
        <p className="error" role="alert">{message}</p>
        <button type="button" onClick={() => void authenticator.signOut()}>Sair</button>
      </div>
    </main>
  )
}
