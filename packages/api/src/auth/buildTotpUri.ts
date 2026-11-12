export function buildTotpUri(email: string, secret: string, issuer: string): string {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(email)}`
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`
}
