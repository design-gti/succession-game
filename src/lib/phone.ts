export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) return '+62' + digits.slice(1)
  if (digits.startsWith('62')) return '+' + digits
  return '+' + digits
}
