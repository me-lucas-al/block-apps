import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ServicesProvider } from './services/ServicesContext'
import { createServices } from './services/createServices'
import { readBrowserTarget } from '../shared/browser/browserTarget'
import '../shared/styles.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <ServicesProvider services={createServices(readBrowserTarget())}>
      <App />
    </ServicesProvider>
  </StrictMode>,
)
