import { useCallback } from 'react'

import { FinanceDreTable } from '@/components/dashboard/FinanceDreTable'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Panel } from '@/components/dashboard/Panel'
import { SimpleBarList } from '@/components/dashboard/SimpleBarList'
import { useAsyncData } from '@/hooks/use-async-data'
import { getFinanceRows } from '@/lib/dashboard-api'
import { useAuthStore } from '@/store/auth-store'
import { useDashboardFilterStore } from '@/store/dashboard-filter-store'
import { getFinanceMetrics } from '@/utils/analytics'
import { formatCurrency, formatPercent } from '@/utils/format'

export default function FinanceiroPage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const companyId = useDashboardFilterStore((state) => state.companyId)
  const month = useDashboardFilterStore((state) => state.month)
  const year = useDashboardFilterStore((state) => state.year)

  const loadFinance = useCallback(async () => {
    if (!accessToken) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    if (!companyId) {
      throw new Error('Selecione uma empresa para carregar o financeiro.')
    }

    const rows = await getFinanceRows(accessToken, month, year, companyId)
    return getFinanceMetrics(rows)
  }, [accessToken, companyId, month, year])

  const { data, isLoading, error } = useAsyncData(loadFinance)

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Módulo</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Financeiro</h2>
        <p className="mt-2 text-sm text-slate-500">Painel com leitura de DRE e resultado operacional para o período selecionado.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Receita bruta" value={data ? formatCurrency(data.receitaBruta) : '...'} helper="Entradas operacionais do período" />
        <MetricCard label="Receita líquida" value={data ? formatCurrency(data.receitaLiquida) : '...'} helper="Receita bruta deduzida de impostos" />
        <MetricCard label="Margem bruta" value={data ? formatCurrency(data.margemBruta) : '...'} helper="Receita líquida menos gastos da venda" />
        <MetricCard label="Resultado operacional" value={data ? formatCurrency(data.resultadoOperacional) : '...'} helper="Lucro antes do financeiro e tributos" />
        <MetricCard label="Despesas financeiras" value={data ? formatCurrency(data.despesasFinanceiras) : '...'} helper="Juros, tarifas e estornos" />
        <MetricCard label="Resultado final" value={data ? formatCurrency(data.resultadoFinal) : '...'} helper="Saldo líquido de caixa" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Composição de despesas" subtitle="Leitura resumida dos principais blocos">
          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {isLoading || !data ? <div className="text-sm text-slate-500">Carregando composição financeira...</div> : <SimpleBarList items={data.composition} formatValue={formatCurrency} />}
        </Panel>

        <Panel title="Resumo executivo" subtitle="Leitura rápida da margem e do caixa">
          {isLoading || !data ? (
            <div className="text-sm text-slate-500">Carregando resumo financeiro...</div>
          ) : (
            <div className="space-y-3">
              {data.dre
                .filter((item) =>
                  [
                    'receita-bruta',
                    'receita-liquida',
                    'margem-bruta',
                    'resultado-operacional',
                    'resultado-final',
                  ].includes(item.id)
                )
                .map((item) => (
                <div
                  key={item.id}
                  className={[
                    'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm',
                    (item.variant === 'income' || (item.variant !== 'expense' && item.value >= 0)) && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                    item.variant === 'expense' && 'border-rose-200 bg-rose-50 text-rose-700',
                    item.variant === 'highlight' && item.value < 0 && 'border-rose-200 bg-rose-50 text-rose-700',
                    item.variant === 'result' && item.value < 0 && 'border-rose-200 bg-rose-50 text-rose-700',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span>{item.label}</span>
                  <strong>{formatCurrency(item.prefix === '(-)' ? item.value * -1 : item.value)}</strong>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <Panel title="DRE detalhada" subtitle="Análise vertical com abertura do segundo nível por subconta">
        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {isLoading || !data ? <div className="text-sm text-slate-500">Carregando DRE detalhada...</div> : <FinanceDreTable rows={data.dre} />}
      </Panel>
    </div>
  )
}
