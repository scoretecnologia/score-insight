import { describe, expect, it } from 'vitest'

import { getFinanceMetrics, getSalesMetrics, getStockMetrics } from '@/utils/analytics'
import { financeRows, newCustomerRows, salesRows, stockRows } from '@/utils/mock-data'

describe('analytics', () => {
  it('calcula metricas de estoque', () => {
    const metrics = getStockMetrics(stockRows)

    expect(metrics.totalItens).toBe(stockRows.length)
    expect(metrics.custoTotal).toBeGreaterThan(0)
    expect(metrics.topDepartamentos.length).toBeGreaterThan(0)
  })

  it('calcula metricas de vendas', () => {
    const metrics = getSalesMetrics(salesRows, newCustomerRows)

    expect(metrics.numeroVendas).toBe(8)
    expect(metrics.clientesNovos).toBe(4)
    expect(metrics.faturamento).toBeCloseTo(2968.4, 1)
  })

  it('calcula metricas financeiras', () => {
    const metrics = getFinanceMetrics(financeRows)

    expect(metrics.receitaBruta).toBe(86300)
    expect(metrics.gastosVenda).toBe(29200)
    expect(metrics.saldoLiquidoCaixa).toBe(24190)
  })
})
