import { useHostAccess } from '../../hooks/useHostAccess'
import { HostAccessNotice } from './HostAccessNotice'

export function HostAccessWarning() {
  const { granted, requestAccess } = useHostAccess()

  return <HostAccessNotice granted={granted} onRequestAccess={() => void requestAccess()} />
}
