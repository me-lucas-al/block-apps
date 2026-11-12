import { useIncognitoAccess } from '../../hooks/useIncognitoAccess'
import { useServices } from '../../services/ServicesContext'

export function IncognitoWarning() {
  const { incognito } = useServices()
  const allowed = useIncognitoAccess()

  if (allowed !== false) return null

  return (
    <div className="warning" role="alert">
      <strong>Modo anônimo desprotegido.</strong>
      <p>
        Ative "Permitir no modo anônimo" nas configurações da extensão para
        bloquear sites e buscas proibidas também em abas anônimas.
      </p>
      <button type="button" onClick={() => void incognito.openSettings()}>
        Abrir configurações
      </button>
    </div>
  )
}
