import { useCallback, useMemo, useState } from 'react'

import { DataTable } from '@/components/dashboard/DataTable'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Panel } from '@/components/dashboard/Panel'
import { SimpleBarList } from '@/components/dashboard/SimpleBarList'
import { useAsyncData } from '@/hooks/use-async-data'
import { getStockRows } from '@/lib/dashboard-api'
import { useAuthStore } from '@/store/auth-store'
import { useDashboardFilterStore } from '@/store/dashboard-filter-store'
import { getStockMetrics } from '@/utils/analytics'
import { formatCurrency, formatNumber } from '@/utils/format'

export default function EstoquePage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const companyId = useDashboardFilterStore((state) => state.companyId)
  const month = useDashboardFilterStore((state) => state.month)
  const year = useDashboardFilterStore((state) => state.year)
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('Todos')

  const loadStock = useCallback(async () => {
    if (!accessToken) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    if (!companyId) {
      throw new Error('Selecione uma empresa para carregar o estoque.')
    }

    return getStockRows(accessToken, companyId)
  }, [accessToken, companyId])

  const { data: stockRows, isLoading, error } = useAsyncData(loadStock)

  const departments = useMemo(
    () => ['Todos', ...new Set((stockRows ?? []).map((item) => item.departamento))],
    [stockRows]
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return (stockRows ?? []).filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        row.descricao.toLowerCase().includes(normalizedQuery) ||
        row.ean.toLowerCase().includes(normalizedQuery) ||
        row.departamento.toLowerCase().includes(normalizedQuery) ||
        row.marca.toLowerCase().includes(normalizedQuery) ||
        row.cor.toLowerCase().includes(normalizedQuery)
      const matchesDepartment = department === 'Todos' || row.departamento === department
      return matchesQuery && matchesDepartment
    })
  }, [department, query, stockRows])

  const metrics = useMemo(() => getStockMetrics(filteredRows), [filteredRows])

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Módulo</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Estoque</h2>
          <p className="mt-2 text-sm text-slate-500">
            Posição atual de inventário com filtros locais. Período global selecionado: {String(month).padStart(2, '0')}/{year}.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar produto, EAN, departamento, marca ou cor"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white"
          />
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:bg-white"
          >
            {departments.map((item) => (
              <option key={item} value={item} className="bg-white">
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Custo total" value={isLoading ? '...' : formatCurrency(metrics.custoTotal)} helper="Capital investido no estoque filtrado" />
        <MetricCard label="Valor de venda" value={isLoading ? '...' : formatCurrency(metrics.valorVendaTotal)} helper="Potencial bruto de faturamento" />
        <MetricCard label="Itens ativos" value={isLoading ? '...' : formatNumber(metrics.totalItens)} helper="Produtos com quantidade positiva" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Top departamentos" subtitle="Volume por categoria">
          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {isLoading ? <div className="text-sm text-slate-500">Carregando departamentos...</div> : <SimpleBarList items={metrics.topDepartamentos} formatValue={formatNumber} />}
        </Panel>

        <Panel title="Itens em estoque" subtitle="Listagem detalhada da base real">
          <DataTable
            rows={filteredRows}
            columns={[
              { key: 'descricao', header: 'Produto', cell: (row) => row.descricao, sortValue: (row) => row.descricao },
              { key: 'departamento', header: 'Departamento', cell: (row) => row.departamento, sortValue: (row) => row.departamento },
              { key: 'quantidade', header: 'Qtd', cell: (row) => formatNumber(row.quantidade), sortValue: (row) => row.quantidade },
              { key: 'custo', header: 'Custo', cell: (row) => formatCurrency(row.custo), sortValue: (row) => row.custo },
              { key: 'valorVenda', header: 'Venda', cell: (row) => formatCurrency(row.valorVenda), sortValue: (row) => row.valorVenda },
            ]}
          />
        </Panel>
      </section>
    </div>
  )
}
