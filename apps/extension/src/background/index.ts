import { composeBackground } from './composition'
import { registerListeners } from './listeners'
import { registerSearchNavigationListeners } from './searchNavigationListeners'

const services = composeBackground()
registerListeners(services)
registerSearchNavigationListeners(services)
