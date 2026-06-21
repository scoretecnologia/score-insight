import type { PropsWithChildren, ReactNode } from 'react'

type PanelProps = PropsWithChildren<{
  title: string
  subtitle?: string
  action?: ReactNode
}>

export function Panel({ title, subtitle, action, children }: PanelProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="pt-4">{children}</div>
    </section>
  )
}
