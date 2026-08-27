export function sanitizeName(raw: string): string {
  return raw.trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, 24)
}

export function defaultNickname(): string {
  const n = 1000 + Math.floor(Math.random() * 9000)
  return `Player ${n}`
}

export function resolveName(raw: string): string {
  const clean = sanitizeName(raw)
  return clean.length > 0 ? clean : defaultNickname()
}
