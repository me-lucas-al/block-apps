import { useHostAccess } from '../../hooks/useHostAccess'

export function HostAccessWarning() {
  const { granted, requestAccess } = useHostAccess()

  if (granted !== false) return null

  return (
    <div className="warning" role="alert">
      <strong>Acesso aos sites desativado.</strong>
      <p>
        Sem acesso a todos os sites a extensão não consegue bloquear nada.
        Conceda a permissão para ativar o bloqueio.
      </p>
      <button type="button" onClick={() => void requestAccess()}>
        Conceder acesso
      </button>
    </div>
  )
}
