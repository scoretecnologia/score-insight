import { useCallback } from 'react'
import { ArrowRight, Boxes, ShoppingBag, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MetricCard } from '@/components/dashboard/MetricCard'
import { Panel } from '@/components/dashboard/Panel'
import { useAsyncData } from '@/hooks/use-async-data'
import { getFinanceRows, getSalesData, getStockRows } from '@/lib/dashboard-api'
import { useAuthStore } from '@/store/auth-store'
import { useDashboardFilterStore } from '@/store/dashboard-filter-store'
import { getFinanceMetrics, getSalesMetrics, getStockMetrics } from '@/utils/analytics'
import { inMonth } from '@/utils/date'
import { formatCurrency, formatNumber } from '@/utils/format'

const shortcuts = [
  {
    title: 'Financeiro',
    description: 'DRE, composição de despesas e leitura de caixa.',
    to: '/dashboard/financeiro',
    icon: Wallet,
  },
  {
    title: 'Vendas',
    description: 'Faturamento, ticket médio e performance comercial.',
    to: '/dashboard/vendas',
    icon: ShoppingBag,
  },
  {
    title: 'Estoque',
    description: 'Visão de itens, valor investido e top departamentos.',
    to: '/dashboard/estoque',
    icon: Boxes,
  },
]

export default function DashboardHome() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const companyId = useDashboardFilterStore((state) => state.companyId)
  const month = useDashboardFilterStore((state) => state.month)
  const year = useDashboardFilterStore((state) => state.year)

  const loadDashboard = useCallback(async () => {
    if (!accessToken) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    if (!companyId) {
      throw new Error('Selecione uma empresa para carregar o dashboard.')
    }

    const [stockRows, salesData, financeRows] = await Promise.all([
      getStockRows(accessToken, companyId, month, year),
      getSalesData(accessToken, companyId),
      getFinanceRows(accessToken, month, year, companyId),
    ])

    const filteredSales = salesData.sales.filter((row) => inMonth(row.data, month, year))

    const filteredCustomers = salesData.customers.filter((row) => inMonth(row.dataCadastro, month, year))

    return {
      stockMetrics: getStockMetrics(stockRows),
      salesMetrics: getSalesMetrics(filteredSales, filteredCustomers),
      financeMetrics: getFinanceMetrics(financeRows),
    }
  }, [accessToken, companyId, month, year])

  const { data, isLoading, error } = useAsyncData(loadDashboard)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          label="Faturamento"
          value={data ? formatCurrency(data.salesMetrics.faturamento) : '...'}
          helper={isLoading ? 'Carregando vendas reais' : 'Base real de vendas'}
        />
        <MetricCard
          label="Saldo de Caixa"
          value={data ? formatCurrency(data.financeMetrics.saldoLiquidoCaixa) : '...'}
          helper={isLoading ? 'Carregando financeiro real' : 'Resultado líquido estimado'}
        />
        <MetricCard
          label="Valor de Estoque"
          value={data ? formatCurrency(data.stockMetrics.valorVendaTotal) : '...'}
          helper={isLoading ? 'Carregando estoque real' : 'Potencial de venda atual'}
        />
        <MetricCard
          label="Clientes Novos"
          value={data ? formatNumber(data.salesMetrics.clientesNovos) : '...'}
          helper={isLoading ? 'Carregando clientes reais' : 'Entradas no período atual'}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Visão do momento" subtitle="Leitura rápida do negócio com dados remotos">
          {error ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Margem de contribuição</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {data ? formatCurrency(data.financeMetrics.margemContribuicao) : '...'}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {isLoading ? 'Consolidando resultado bruto do período.' : 'Resultado bruto após custos variáveis.'}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Itens ativos</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {data ? formatNumber(data.stockMetrics.totalItens) : '...'}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {isLoading ? 'Consultando saldo positivo em estoque.' : 'Produtos com saldo positivo no estoque.'}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Atalhos dos módulos" subtitle="Acesse os painéis especializados">
          <div className="space-y-3">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon

              return (
                <Link
                  key={shortcut.to}
                  to={shortcut.to}
                  className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-emerald-200 hover:bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{shortcut.title}</p>
                      <p className="text-sm text-slate-500">{shortcut.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-slate-400" />
                </Link>
              )
            })}
          </div>
        </Panel>
      </section>
    </div>
  )
}
