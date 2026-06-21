import type { ReactNode } from 'react'

type Column<T> = {
  key: string
  header: string
  cell: (row: T) => ReactNode
}

type DataTableProps<T> = {
  columns: Column<T>[]
  rows: T[]
}

export function DataTable<T>({ columns, rows }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <div className="max-h-[440px] overflow-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-slate-50/95 backdrop-blur">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
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
