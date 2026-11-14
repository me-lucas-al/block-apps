interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_COGNITO_USER_POOL_ID?: string
  readonly VITE_COGNITO_CLIENT_ID?: string
  readonly VITE_COGNITO_HOSTED_DOMAIN?: string
  readonly VITE_TARGET_BROWSER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
