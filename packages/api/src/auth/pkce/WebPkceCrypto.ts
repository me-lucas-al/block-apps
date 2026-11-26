import type { PkceCrypto } from './PkceCrypto'

export class WebPkceCrypto implements PkceCrypto {
  randomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length))
  }

  async sha256Base64(text: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    const binary = Array.from(new Uint8Array(digest), (byte) => String.fromCharCode(byte))
    return btoa(binary.join(''))
  }
}
