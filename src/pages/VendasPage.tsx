import { useCallback } from 'react'

import { DataTable } from '@/components/dashboard/DataTable'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Panel } from '@/components/dashboard/Panel'
import { SimpleBarList } from '@/components/dashboard/SimpleBarList'
import { VerticalBarChart } from '@/components/dashboard/VerticalBarChart'
import { useAsyncData } from '@/hooks/use-async-data'
import { getSalesData } from '@/lib/dashboard-api'
import { useAuthStore } from '@/store/auth-store'
import { useDashboardFilterStore } from '@/store/dashboard-filter-store'
import { getSalesMetrics } from '@/utils/analytics'
import { formatCompactThousands, formatCurrency, formatDate, formatNumber } from '@/utils/format'

export default function VendasPage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const companyId = useDashboardFilterStore((state) => state.companyId)
  const month = useDashboardFilterStore((state) => state.month)
  const year = useDashboardFilterStore((state) => state.year)
  const loadSales = useCallback(async () => {
    if (!accessToken) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    if (!companyId) {
      throw new Error('Selecione uma empresa para carregar as vendas.')
    }

    const result = await getSalesData(accessToken, companyId)
    const filteredSales = result.sales.filter((row) => {
      const date = new Date(`${row.data}T00:00:00`)
      return date.getMonth() + 1 === month && date.getFullYear() === year
    })

    const filteredCustomers = result.customers.filter((row) => {
      const date = new Date(`${row.dataCadastro}T00:00:00`)
      return date.getMonth() + 1 === month && date.getFullYear() === year
    })

    return {
      sales: filteredSales,
      customers: filteredCustomers,
      metrics: getSalesMetrics(filteredSales, filteredCustomers),
    }
  }, [accessToken, companyId, month, year])

  const { data, isLoading, error } = useAsyncData(loadSales)

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Módulo</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Vendas</h2>
        <p className="mt-2 text-sm text-slate-500">KPIs comerciais e leitura de desempenho sobre o período selecionado.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Faturamento" value={data ? formatCurrency(data.metrics.faturamento) : '...'} helper="Soma total das vendas" />
        <MetricCard label="Itens vendidos" value={data ? formatNumber(data.metrics.itensVendidos) : '...'} helper="Volume total de peças" />
        <MetricCard label="Nº de vendas" value={data ? formatNumber(data.metrics.numeroVendas) : '...'} helper="Total de cupons distintos" />
        <MetricCard label="Ticket médio" value={data ? formatCurrency(data.metrics.ticketMedio) : '...'} helper="Faturamento por venda" />
        <MetricCard label="Peças por venda" value={data ? formatNumber(Number(data.metrics.pecasPorVenda.toFixed(1))) : '...'} helper="Média de itens por cupom" />
        <MetricCard label="Clientes novos" value={data ? formatNumber(data.metrics.clientesNovos) : '...'} helper="Cadastros no período" />
      </section>

      <Panel title="Vendas por dia" subtitle="Gráfico de barras por dia do período">
        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {isLoading || !data ? (
          <div className="text-sm text-slate-500">Carregando distribuição diária...</div>
        ) : (
          <VerticalBarChart items={data.metrics.vendasPorDia} formatValue={formatCurrency} formatLabel={formatCompactThousands} />
        )}
      </Panel>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Departamentos" subtitle="Top 5 por faturamento">
          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {isLoading || !data ? (
            <div className="text-sm text-slate-500">Carregando departamentos...</div>
          ) : (
            <SimpleBarList items={data.metrics.vendasPorDepartamento.slice(0, 5)} formatValue={formatCurrency} />
          )}
        </Panel>

        <Panel title="Vendedores" subtitle="Top 5 por faturamento">
          {isLoading || !data ? (
            <div className="text-sm text-slate-500">Carregando vendedores...</div>
          ) : (
            <SimpleBarList items={data.metrics.performanceVendedores.slice(0, 5)} formatValue={formatCurrency} />
          )}
        </Panel>
      </section>

      <Panel title="Listagem detalhada" subtitle="Base real de vendas">
        <DataTable
          rows={data?.sales ?? []}
          columns={[
            { key: 'codVenda', header: 'Venda', cell: (row) => row.codVenda },
            { key: 'descricao', header: 'Descrição', cell: (row) => row.descricao },
            { key: 'vendedor', header: 'Vendedor', cell: (row) => row.vendedor },
            { key: 'cliente', header: 'Cliente', cell: (row) => row.cliente },
            { key: 'data', header: 'Data', cell: (row) => formatDate(row.data) },
            { key: 'total', header: 'Total', cell: (row) => formatCurrency(row.total) },
          ]}
        />
      </Panel>
    </div>
  )
}
