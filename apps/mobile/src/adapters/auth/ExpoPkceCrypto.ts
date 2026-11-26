import type { PkceCrypto } from '@block-apps/api'
import { CryptoDigestAlgorithm, CryptoEncoding, digestStringAsync, getRandomBytes } from 'expo-crypto'

export class ExpoPkceCrypto implements PkceCrypto {
  randomBytes(length: number): Uint8Array {
    return getRandomBytes(length)
  }

  sha256Base64(text: string): Promise<string> {
    return digestStringAsync(CryptoDigestAlgorithm.SHA256, text, {
      encoding: CryptoEncoding.BASE64,
    })
  }
}
