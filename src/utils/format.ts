import { parseBrDate } from './date'

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCompactThousands(value: number) {
  const absoluteValue = Math.abs(value)

  if (absoluteValue >= 1000) {
    const compactValue = Math.floor(absoluteValue / 1000)
    return `${value < 0 ? '-' : ''}${compactValue}k`
  }

  return formatNumber(Math.round(value))
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercentCompact(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(value: string) {
  const p = parseBrDate(value)
  if (!p) return value
  const d = String(p.d).padStart(2, '0')
  const m = String(p.m).padStart(2, '0')
  return `${d}/${m}/${p.y}`
}
