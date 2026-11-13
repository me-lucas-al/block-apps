export interface PkceCrypto {
  randomBytes(length: number): Uint8Array
  sha256Base64(text: string): Promise<string>
}
