type MetricCardProps = {
  label: string
  value: string
  helper: string
}

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)]">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </article>
  )
}
