import { handle } from '@hono/aws-lambda'
import { createAdminUseCases } from '../composition/createAdminUseCases'
import { createCognitoAdminCollaborators } from '../composition/createCognitoAdminCollaborators'
import { readAdminAppAccessFromEnvironment } from '../composition/readAdminAppAccessFromEnvironment'
import { createAdminApp } from '../http/app/createAdminApp'
import { createLazyHandler } from './createLazyHandler'

export const adminHandler = createLazyHandler(() => {
  const useCases = createAdminUseCases(createCognitoAdminCollaborators())
  return handle(createAdminApp(readAdminAppAccessFromEnvironment(), useCases))
})
