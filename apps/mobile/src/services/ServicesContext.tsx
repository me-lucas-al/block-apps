import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { Services } from './createServices'

const ServicesContext = createContext<Services | null>(null)

type ServicesProviderProps = {
  services: Services
  children: ReactNode
}

export function ServicesProvider({ services, children }: ServicesProviderProps) {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  )
}

export function useServices(): Services {
  const services = useContext(ServicesContext)
  if (!services) throw new Error('useServices must be used inside ServicesProvider')
  return services
}
