type VerticalBarChartItem = {
  label: string
  value: number
}

type VerticalBarChartProps = {
  items: VerticalBarChartItem[]
  formatValue: (value: number) => string
  formatLabel?: (value: number) => string
}

export function VerticalBarChart({ items, formatValue, formatLabel = formatValue }: VerticalBarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex w-full items-end gap-2 rounded-[24px] border border-slate-200 bg-slate-50 px-4 pb-4 pt-6">
        {items.map((item) => {
          const height = Math.max((item.value / max) * 220, 8)

          return (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
              <span className="text-center text-xs font-medium text-slate-500">{formatLabel(item.value)}</span>
              <div className="flex h-[220px] w-full items-end justify-center rounded-t-[18px] bg-white/70 px-1">
                <div
                  className="w-full rounded-t-[16px] bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-[0_10px_24px_-16px_rgba(16,185,129,0.9)]"
                  style={{ height }}
                  title={`${item.label}: ${formatValue(item.value)}`}
                />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
