type SimpleBarListItem = {
  label: string
  value: number
}

type SimpleBarListProps = {
  items: SimpleBarListItem[]
  formatValue: (value: number) => string
}

export function SimpleBarList({ items, formatValue }: SimpleBarListProps) {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-700">{item.label}</span>
            <span className="text-slate-500">{formatValue(item.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
