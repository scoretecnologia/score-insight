import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import type { FinanceDreRow } from '@/types'
import { formatCurrency, formatPercentCompact } from '@/utils/format'

type FinanceDreTableProps = {
  rows: FinanceDreRow[]
}

function getSignedValue(row: FinanceDreRow) {
  if (row.prefix === '(-)') {
    return row.value * -1
  }

  return row.value
}

function getValueTone(row: FinanceDreRow) {
  const signedValue = getSignedValue(row)

  if (row.variant === 'expense') {
    return 'text-rose-600'
  }

  if (signedValue > 0) {
    return 'text-emerald-600'
  }

  if (signedValue < 0) {
    return 'text-rose-600'
  }

  return 'text-slate-500'
}

function getRowAccent(row: FinanceDreRow) {
  if (row.variant === 'expense') {
    return 'border-l-rose-500'
  }

  if (row.variant === 'highlight') {
    return getSignedValue(row) >= 0 ? 'border-l-emerald-500' : 'border-l-rose-500'
  }

  return 'border-l-emerald-500'
}

export function FinanceDreTable({ rows }: FinanceDreTableProps) {
  const initialExpanded = useMemo(
    () =>
      new Set(
        rows
          .filter((row) => row.id === 'gastos-venda')
          .map((row) => row.id)
      ),
    [rows]
  )
  const [expandedRows, setExpandedRows] = useState<Set<string>>(initialExpanded)

  useEffect(() => {
    setExpandedRows(initialExpanded)
  }, [initialExpanded])

  function toggleRow(rowId: string) {
    setExpandedRows((current) => {
      const next = new Set(current)

      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }

      return next
    })
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <div className="border-l-2 border-l-rose-500 bg-white px-5 py-4 text-sm font-semibold text-slate-700">
        DRE - Demonstrativo de Resultado do Exercício
      </div>

      <div className="divide-y divide-slate-200 bg-white">
        {rows.map((row) => {
          const isExpanded = expandedRows.has(row.id)
          const hasDetails = row.details.length > 0
          const signedValue = getSignedValue(row)
          const toneClass = getValueTone(row)

          return (
            <div key={row.id}>
              <div
                className={[
                  'grid grid-cols-[minmax(0,1fr)_180px_90px_28px] items-center gap-4 px-5 py-3 transition',
                  'border-l-2 bg-white',
                  getRowAccent(row),
                ].join(' ')}
              >
                <div className="min-w-0">
                  <button
                    type="button"
                    disabled={!hasDetails}
                    onClick={() => toggleRow(row.id)}
                    className={[
                      'flex w-full items-center justify-between gap-3 text-left',
                      hasDetails ? 'cursor-pointer' : 'cursor-default',
                    ].join(' ')}
                  >
                    <span className="truncate text-[15px] font-semibold text-slate-900">
                      {row.prefix} {row.label}
                    </span>
                    {hasDetails ? (
                      isExpanded ? <ChevronUp className="size-4 shrink-0 text-slate-500" /> : <ChevronDown className="size-4 shrink-0 text-slate-500" />
                    ) : (
                      <span className="size-4 shrink-0" />
                    )}
                  </button>
                </div>

                <div className={['text-right text-[15px] font-semibold', toneClass].join(' ')}>{formatCurrency(signedValue)}</div>
                <div className={['text-right text-sm font-semibold', toneClass].join(' ')}>{formatPercentCompact(row.verticalAnalysis)}</div>
                <div />
              </div>

              {hasDetails && isExpanded ? (
                <div className="border-l-2 border-l-slate-200 bg-slate-50/60 px-5 py-1">
                  <div className="ml-3 space-y-1 border-l border-slate-200 py-2 pl-4">
                    {row.details.map((detail) => (
                      <div key={`${row.id}-${detail.label}`} className="grid grid-cols-[minmax(0,1fr)_180px_90px] items-center gap-4 py-1.5">
                        <div className="truncate text-[15px] text-slate-600">{detail.label}</div>
                        <div className="text-right text-[15px] text-slate-900">{formatCurrency(row.prefix === '(-)' ? detail.value * -1 : detail.value)}</div>
                        <div className="text-right text-sm text-slate-500">{formatPercentCompact(detail.participation)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
