import { useServices } from '../services/ServicesContext'

type ForbiddenScreenProps = {
  email: string
}

export function ForbiddenScreen({ email }: ForbiddenScreenProps) {
  const { authenticator } = useServices()

  return (
    <main className="center">
      <div className="card stack">
        <h1>Acesso restrito</h1>
        <p>
          A conta <strong>{email}</strong> não é de administrador. Use o aplicativo ou a extensão
          do Block Apps para gerenciar seus bloqueios.
        </p>
        <button type="button" onClick={() => void authenticator.signOut()}>Sair</button>
      </div>
    </main>
  )
}
