export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) return '+62' + digits.slice(1)
  if (digits.startsWith('62')) return '+' + digits
  if (digits.startsWith('8')) return '+62' + digits  // bare Indonesian mobile
  return '+' + digits  // already has country code stripped of +
}
