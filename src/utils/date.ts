export function parseBrDate(s: string): { d: number; m: number; y: number } | null {
  if (!s) return null
  const str = String(s).trim()
  if (!str) return null

  // ISO: YYYY-MM-DD
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    const y = parseInt(iso[1], 10)
    const m = parseInt(iso[2], 10)
    const d = parseInt(iso[3], 10)
    if (d && m && y) return { d, m, y }
  }

  // BR: DD/MM/YYYY
  const parts = str.split('/')
  if (parts.length >= 3) {
    const d = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    const y = parseInt(parts[2], 10)
    if (d && m && y) return { d, m, y }
  }

  return null
}

export function inMonth(dateStr: string, month: number, year: number): boolean {
  const p = parseBrDate(dateStr)
  if (!p) return false
  return p.m === month && p.y === year
}
