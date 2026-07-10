import type { FinanceDreDetailRow, FinanceDreRow, FinanceRow, NewCustomerRow, SalesRow, StockRow } from '@/types'

function normalizeGroupName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const financeGroups = {
  receitaBruta: [
    'vendas em...',
    'vendas',
    'recebimento total',
  ],
  impostos: [
    'impostos (-)',
    'impostos',
  ],
  gastosVenda: [
    'custos com fornecedores (-)',
    'custos com produtos (-)',
    'custos tributarios e financeiros (-)',
    'custos tributarios ou financeiros (-)',
    'custos com embalagens (-)',
    'embalagens (-)',
    'fretes e entregas (-)',
    'fretes e entrega (-)',
    'bonificacoes e vendas (-)',
    'despesas com viagens (-)',
    'despesas de viagens (-)',
  ],
  gastosEstrutura: [
    'despesas administrativas (-)',
    'investimentos em desenvolvimento empresarial (-)',
    'saidas nao operacionais (-)',
    'investimentos em marketing (-)',
    'investimentos em bens materiais (-)',
    'despesas com materiais e equipamentos (-)',
    'despesas com veiculos (-)',
    'despesas financeiras fixas (-)',
  ],
  gastosPessoal: [
    'despesas com pessoal (-)',
    'pessoal (-)'
  ],
  receitasFinanceiras: ['receitas financeiras'],
  despesasFinanceiras: ['despesas financeiras'],
  impostosRendaCsll: [
    'impostos de renda e csll',
    'impostos de renda e csll (-)',
  ]
}

export function getStockMetrics(rows: StockRow[]) {
  const custoTotal = rows.reduce((sum, row) => sum + row.quantidade * row.custo, 0)
  const valorVendaTotal = rows.reduce((sum, row) => sum + row.quantidade * row.valorVenda, 0)
  const totalItens = rows.filter((row) => row.quantidade > 0).length

  const topDepartamentos = Object.values(
    rows.reduce<Record<string, { label: string; value: number }>>((acc, row) => {
      acc[row.departamento] ??= { label: row.departamento, value: 0 }
      acc[row.departamento].value += row.quantidade
      return acc
    }, {})
  )
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  return { custoTotal, valorVendaTotal, totalItens, topDepartamentos }
}

export function getSalesMetrics(sales: SalesRow[], customers: NewCustomerRow[]) {
  const faturamento = sales.reduce((sum, row) => sum + row.total, 0)
  const itensVendidos = sales.reduce((sum, row) => sum + Math.max(row.quantVendida, 0), 0)
  const numeroVendas = new Set(sales.map((row) => row.codVenda)).size
  const ticketMedio = itensVendidos ? faturamento / itensVendidos : 0
  const pecasPorVenda = numeroVendas ? itensVendidos / numeroVendas : 0
  const clientesNovos = customers.length

  const vendasPorDepartamento = Object.values(
    sales.reduce<Record<string, { label: string; value: number }>>((acc, row) => {
      acc[row.departamento] ??= { label: row.departamento, value: 0 }
      acc[row.departamento].value += row.total
      return acc
    }, {})
  ).sort((a, b) => b.value - a.value)

  const performanceVendedores = Object.values(
    sales.reduce<Record<string, { label: string; value: number }>>((acc, row) => {
      acc[row.vendedor] ??= { label: row.vendedor, value: 0 }
      acc[row.vendedor].value += row.total
      return acc
    }, {})
  ).sort((a, b) => b.value - a.value)

  const vendasPorDia = Object.values(
    sales.reduce<Record<string, { label: string; value: number }>>((acc, row) => {
      acc[row.data] ??= { label: row.data.slice(8, 10), value: 0 }
      acc[row.data].value += row.total
      return acc
    }, {})
  ).sort((a, b) => Number(a.label) - Number(b.label))

  return {
    faturamento,
    itensVendidos,
    numeroVendas,
    ticketMedio,
    pecasPorVenda,
    clientesNovos,
    vendasPorDepartamento,
    performanceVendedores,
    vendasPorDia,
  }
}

function sumByGroup(rows: FinanceRow[], groupNames: string[]) {
  return rows
    .filter((row) => groupNames.includes(normalizeGroupName(row.totalizadora)))
    .reduce((sum, row) => sum + row.valor, 0)
}

function buildGroupDetails(rows: FinanceRow[], groupNames: string[]) {
  const groupRows = rows.filter((row) => groupNames.includes(normalizeGroupName(row.totalizadora)))
  const groupTotal = groupRows.reduce((sum, row) => sum + row.valor, 0)

  return Object.values(
    groupRows.reduce<Record<string, FinanceDreDetailRow>>((acc, row) => {
      const key = row.subconta?.trim() || row.totalizadora

      acc[key] ??= {
        label: key,
        value: 0,
        participation: 0,
      }

      acc[key].value += row.valor
      return acc
    }, {})
  )
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      ...item,
      participation: groupTotal ? item.value / groupTotal : 0,
    }))
}

function createDreRow(
  id: string,
  label: string,
  prefix: FinanceDreRow['prefix'],
  value: number,
  receitaBruta: number,
  variant: FinanceDreRow['variant'],
  details: FinanceDreDetailRow[] = []
): FinanceDreRow {
  const signedValue = prefix === '(-)' ? value * -1 : value

  return {
    id,
    label,
    prefix,
    value,
    verticalAnalysis: receitaBruta ? signedValue / receitaBruta : 0,
    variant,
    details,
  }
}

export function getFinanceMetrics(rows: FinanceRow[]) {
  const receitaBruta = sumByGroup(rows, financeGroups.receitaBruta)
  const impostos = sumByGroup(rows, financeGroups.impostos)
  const receitaLiquida = receitaBruta - impostos
  const gastosVenda = sumByGroup(rows, financeGroups.gastosVenda)
  const margemBruta = receitaLiquida - gastosVenda
  const gastosEstrutura = sumByGroup(rows, financeGroups.gastosEstrutura)
  const gastosPessoal = sumByGroup(rows, financeGroups.gastosPessoal)
  
  const resultadoOperacional = margemBruta - gastosEstrutura - gastosPessoal
  
  const receitasFinanceiras = sumByGroup(rows, financeGroups.receitasFinanceiras)
  const despesasFinanceiras = sumByGroup(rows, financeGroups.despesasFinanceiras)
  
  const resultadoAntesIrCsll = resultadoOperacional + receitasFinanceiras - despesasFinanceiras
  const impostosRendaCsll = sumByGroup(rows, financeGroups.impostosRendaCsll)
  const resultadoFinal = resultadoAntesIrCsll - impostosRendaCsll

  // Aliases for compatibility
  const gastosOperacionaisFixos = gastosPessoal + gastosEstrutura
  const totalDespesas = gastosVenda + gastosEstrutura + gastosPessoal + despesasFinanceiras
  const margemContribuicao = margemBruta
  const margemContribuicaoPercentual = receitaBruta ? margemContribuicao / receitaBruta : 0
  const lucroAntesProLabore = resultadoOperacional
  const lucroAposInvestimentos = resultadoOperacional
  const saldoLiquidoCaixa = resultadoFinal

  const composition = [
    { label: 'Gastos da venda', value: gastosVenda },
    { label: 'Pessoal', value: gastosPessoal },
    { label: 'Estrutura', value: gastosEstrutura },
    { label: 'Despesas financeiras', value: despesasFinanceiras },
  ].filter((item) => item.value > 0)

  const dre = [
    createDreRow('receita-bruta', 'RECEITA BRUTA', '(+)', receitaBruta, receitaBruta, 'income', buildGroupDetails(rows, financeGroups.receitaBruta)),
    createDreRow('impostos', 'IMPOSTOS', '(-)', impostos, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.impostos)),
    createDreRow('receita-liquida', 'RECEITA LÍQUIDA', '(=)', receitaLiquida, receitaBruta, 'result'),
    createDreRow('gastos-venda', 'GASTOS DA VENDA', '(-)', gastosVenda, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.gastosVenda)),
    createDreRow('margem-bruta', 'MARGEM BRUTA', '(=)', margemBruta, receitaBruta, 'result'),
    createDreRow('gastos-estrutura', 'GASTOS DA ESTRUTURA', '(-)', gastosEstrutura, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.gastosEstrutura)),
    createDreRow('gastos-pessoal', 'GASTOS PESSOAL', '(-)', gastosPessoal, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.gastosPessoal)),
    createDreRow('resultado-operacional', 'RESULTADO OPERACIONAL', '(=)', resultadoOperacional, receitaBruta, 'result'),
    createDreRow('receitas-financeiras', 'RECEITAS FINANCEIRAS', '(+)', receitasFinanceiras, receitaBruta, 'income', buildGroupDetails(rows, financeGroups.receitasFinanceiras)),
    createDreRow('despesas-financeiras', 'DESPESAS FINANCEIRAS', '(-)', despesasFinanceiras, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.despesasFinanceiras)),
    createDreRow('resultado-antes-ir-csll', 'RESULTADO ANTES DO IR E CSLL', '(=)', resultadoAntesIrCsll, receitaBruta, 'result'),
    createDreRow('impostos-renda-csll', 'IMPOSTOS DE RENDA E CSLL', '(-)', impostosRendaCsll, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.impostosRendaCsll)),
    createDreRow('resultado-final', 'RESULTADO FINAL', '(=)', resultadoFinal, receitaBruta, 'highlight'),
  ]

  return {
    receitaBruta,
    impostos,
    receitaLiquida,
    gastosVenda,
    margemBruta,
    gastosEstrutura,
    gastosPessoal,
    resultadoOperacional,
    receitasFinanceiras,
    despesasFinanceiras,
    resultadoAntesIrCsll,
    impostosRendaCsll,
    resultadoFinal,
    composition,
    dre,
    // Aliases for retrocompatibility
    gastosOperacionaisFixos,
    totalDespesas,
    margemContribuicao,
    margemContribuicaoPercentual,
    lucroAntesProLabore,
    lucroAposInvestimentos,
    saldoLiquidoCaixa,
  }
}
