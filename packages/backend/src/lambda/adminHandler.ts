import { handle } from '@hono/aws-lambda'
import { createAdminUseCases } from '../composition/createAdminUseCases'
import { createCognitoAdminCollaborators } from '../composition/createCognitoAdminCollaborators'
import { readRequiredEnvironment } from '../composition/readRequiredEnvironment'
import { createAdminApp } from '../http/app/createAdminApp'
import { createLazyHandler } from './createLazyHandler'

export const adminHandler = createLazyHandler(() => {
  const useCases = createAdminUseCases(createCognitoAdminCollaborators())
  return handle(createAdminApp(readRequiredEnvironment('ADMIN_GROUP_NAME'), useCases))
})
