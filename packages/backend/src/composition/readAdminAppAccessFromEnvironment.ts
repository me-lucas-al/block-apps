import type { AdminAppAccess } from '../http/app/AdminAppAccess'
import { readRequiredEnvironment } from './readRequiredEnvironment'

export function readAdminAppAccessFromEnvironment(): AdminAppAccess {
  return {
    adminGroupName: readRequiredEnvironment('ADMIN_GROUP_NAME'),
    adminClientId: readRequiredEnvironment('ADMIN_CLIENT_ID'),
  }
}
