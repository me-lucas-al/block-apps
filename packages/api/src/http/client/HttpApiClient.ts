import { ApiError } from './ApiError'
import { parseJsonSafe } from './parseJsonSafe'
import { ServerClockRecorder, type ServerClock } from './ServerClockRecorder'

export type HttpApiConfig = {
  readonly baseUrl: string
  readonly getToken: () => Promise<string | null>
  readonly onUnauthorized?: () => Promise<string | null>
}

export class HttpApiClient {
  private readonly baseUrl: string
  private refreshInProgress: Promise<string | null> | null = null
  private readonly serverClockRecorder = new ServerClockRecorder()

  constructor(private readonly config: HttpApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '')
  }

  get serverClock(): ServerClock {
    return this.serverClockRecorder
  }

  get<T>(path: string): Promise<T> {
    return this.execute('GET', path)
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.execute('POST', path, body)
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.execute('PUT', path, body)
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.execute('PATCH', path, body)
  }

  delete<T>(path: string): Promise<T> {
    return this.execute('DELETE', path)
  }

  private async execute<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = await this.config.getToken()
    const initialResponse = await this.send(method, path, body, token)
    if (initialResponse.status !== 401 || !this.config.onUnauthorized) {
      return this.handleResponse<T>(initialResponse)
    }
    const refreshedToken = await this.refreshTokenOnce(this.config.onUnauthorized)
    if (!refreshedToken) {
      return this.handleResponse<T>(initialResponse)
    }
    const retryResponse = await this.send(method, path, body, refreshedToken)
    return this.handleResponse<T>(retryResponse)
  }

  private refreshTokenOnce(refreshToken: () => Promise<string | null>): Promise<string | null> {
    this.refreshInProgress ??= refreshToken().finally(() => {
      this.refreshInProgress = null
    })
    return this.refreshInProgress
  }

  private async send(
    method: string,
    path: string,
    body?: unknown,
    token?: string | null,
  ): Promise<Response> {
    const headers: Record<string, string> = {}
    if (token) headers['authorization'] = `Bearer ${token}`
    if (body !== undefined) headers['content-type'] = 'application/json'

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    this.serverClockRecorder.recordFrom(response)
    return response
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) return undefined as T
    const text = await response.text()
    const parsed = parseJsonSafe(text)
    if (!response.ok) {
      const message = typeof parsed === 'object' && parsed && 'error' in parsed
        ? String(parsed.error)
        : `Request failed with status ${response.status}`
      throw new ApiError(response.status, message, parsed)
    }
    return parsed as T
  }
}
