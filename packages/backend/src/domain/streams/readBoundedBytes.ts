export async function readBoundedBytes(
  stream: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<Uint8Array | null> {
  if (!stream) return new Uint8Array(0)
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  for (;;) {
    const { done, value: chunk } = await reader.read()
    if (done) break
    totalBytes += chunk.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      return null
    }
    chunks.push(chunk)
  }
  return new Uint8Array(Buffer.concat(chunks))
}
