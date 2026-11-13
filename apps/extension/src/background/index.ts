import { composeBackground } from './composition'
import { registerGoogleSignInListener } from './googleSignInListener'
import { registerListeners } from './listeners'
import { registerSearchNavigationListeners } from './searchNavigationListeners'

const services = composeBackground()
registerListeners(services)
registerSearchNavigationListeners(services)
registerGoogleSignInListener(services)
