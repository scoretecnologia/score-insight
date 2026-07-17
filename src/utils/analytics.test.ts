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
    expect(metrics.itensVendidos).toBe(16)
    expect(metrics.ticketMedio).toBeCloseTo(371.05, 1)
  })

  it('calcula metricas de vendas com devolucoes (valores negativos)', () => {
    const salesWithReturns = [
      ...salesRows,
      {
        id: 9,
        codVenda: 'V-14029',
        descricao: 'Devolucao',
        quantVendida: -1,
        vendedor: 'Lucas',
        cliente: 'Carlos Mendes',
        valorUnitario: 100,
        total: -100,
        custo: 0,
        lucro: -100,
        data: '2026-06-16',
        departamento: 'Camisas',
      },
    ]
    const metrics = getSalesMetrics(salesWithReturns, newCustomerRows)

    expect(metrics.faturamento).toBeCloseTo(2868.4, 1)
    expect(metrics.itensVendidos).toBe(16)
    expect(metrics.numeroVendas).toBe(8)
    expect(metrics.ticketMedio).toBeCloseTo(358.55, 1)
  })

  it('calcula metricas financeiras', () => {
    const metrics = getFinanceMetrics(financeRows)

    expect(metrics.receitaBruta).toBe(86300)
    expect(metrics.gastosVenda).toBe(29200)
    expect(metrics.saldoLiquidoCaixa).toBe(24190)
  })
})
