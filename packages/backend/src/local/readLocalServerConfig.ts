import { readMaxRulesPerUser } from '../rules/quota/readMaxRulesPerUser'

const AWS_ENVIRONMENT_SIGNALS = [
  'AWS_LAMBDA_FUNCTION_NAME',
  'AWS_EXECUTION_ENV',
  'ECS_CONTAINER_METADATA_URI',
  'ECS_CONTAINER_METADATA_URI_V4',
  'AWS_WEB_IDENTITY_TOKEN_FILE',
]
const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', 'dynamodb', 'host.docker.internal'])
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

export type LocalServerConfig = {
  readonly endpoint: string
  readonly tableName: string
  readonly port: number
  readonly hostname: string
  readonly allowedOrigins: readonly string[]
  readonly allowedHosts: readonly string[]
  readonly maxRulesPerUser: number
}

function splitList(rawList: string | undefined): string[] {
  return (rawList ?? '').split(',').map((entry) => entry.trim()).filter((entry) => entry.length > 0)
}

function requireLocalDatabaseEndpoint(endpoint: string | undefined): string {
  if (!endpoint) throw new Error('Set DYNAMODB_ENDPOINT, for example http://127.0.0.1:8000')
  if (!LOCAL_DATABASE_HOSTS.has(new URL(endpoint).hostname)) {
    throw new Error('DYNAMODB_ENDPOINT must point to a local DynamoDB')
  }
  return endpoint
}

export function readLocalServerConfig(env: NodeJS.ProcessEnv): LocalServerConfig {
  if (AWS_ENVIRONMENT_SIGNALS.some((signal) => Boolean(env[signal]))) {
    throw new Error('The local server must never run on AWS')
  }
  const hostname = env['HOST'] || '127.0.0.1'
  if (!LOOPBACK_HOSTS.has(hostname) && env['LOCAL_API_ALLOW_REMOTE_HOST'] !== 'true') {
    throw new Error('HOST must be a loopback address unless LOCAL_API_ALLOW_REMOTE_HOST=true')
  }
  return {
    endpoint: requireLocalDatabaseEndpoint(env['DYNAMODB_ENDPOINT']),
    tableName: env['LOCAL_TABLE_NAME'] || 'block-apps-local-data',
    port: Number(env['PORT'] || 3000),
    hostname,
    allowedOrigins: splitList(env['LOCAL_ALLOWED_ORIGINS']),
    allowedHosts: splitList(env['LOCAL_ALLOWED_HOSTS']),
    maxRulesPerUser: readMaxRulesPerUser(env),
  }
}
