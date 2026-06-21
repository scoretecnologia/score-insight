import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

type Column<T> = {
  key: string
  header: string
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
}

type DataTableProps<T> = {
  columns: Column<T>[]
  rows: T[]
}

export function DataTable<T>({ columns, rows }: DataTableProps<T>) {
  const [sortState, setSortState] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const sortedRows = useMemo(() => {
    if (!sortState) {
      return rows
    }

    const activeColumn = columns.find((column) => column.key === sortState.key)

    if (!activeColumn?.sortValue) {
      return rows
    }

    const multiplier = sortState.direction === 'asc' ? 1 : -1

    return [...rows].sort((left, right) => {
      const leftValue = activeColumn.sortValue?.(left)
      const rightValue = activeColumn.sortValue?.(right)

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return (leftValue - rightValue) * multiplier
      }

      return String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'pt-BR', { numeric: true, sensitivity: 'base' }) * multiplier
    })
  }, [columns, rows, sortState])

  function toggleSort(column: Column<T>) {
    if (!column.sortValue) {
      return
    }

    setSortState((current) => {
      if (!current || current.key !== column.key) {
        return { key: column.key, direction: 'asc' }
      }

      if (current.direction === 'asc') {
        return { key: column.key, direction: 'desc' }
      }

      return null
    })
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <div className="max-h-[440px] overflow-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-slate-50/95 backdrop-blur">
            <tr>
              {columns.map((column) => {
                const isActive = sortState?.key === column.key

                return (
                  <th key={column.key} className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className="inline-flex items-center gap-2 text-left text-xs uppercase tracking-[0.18em] text-slate-500 transition hover:text-slate-700"
                      >
                        {column.header}
                        {isActive ? (
                          sortState?.direction === 'asc' ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr key={index} className="border-t border-slate-200 bg-white even:bg-slate-50/60">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-slate-700">
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
