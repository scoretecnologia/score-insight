import type { FinanceDreDetailRow, FinanceDreRow, FinanceRow, NewCustomerRow, SalesRow, StockRow } from '@/types'

const financeGroups = {
  receitaBruta: ['VENDAS EM...', 'VENDAS', 'RECEBIMENTO TOTAL'],
  gastosVenda: ['CUSTOS COM FORNECEDORES (-)', 'CUSTOS TRIBUTARIOS E FINANCEIROS (-)', 'CUSTOS COM EMBALAGENS (-)', 'FRETES E ENTREGAS (-)'],
  gastosPessoal: ['DESPESAS COM PESSOAL (-)'],
  gastosEstrutura: ['DESPESAS ADMINISTRATIVAS (-)', 'DESPESAS FINANCEIRAS FIXAS (-)', 'DESPESAS COM MATERIAIS E EQUIPAMENTOS (-)', 'DESPESAS COM VIAGENS (-)'],
  investimentos: ['INVESTIMENTOS EM MARKETING (-)', 'INVESTIMENTOS EM DESENVOLVIMENTO EMPRESARIAL (-)', 'INVESTIMENTOS EM BENS MATERIAIS (-)'],
  receitasFinanceiras: ['RECEITAS FINANCEIRAS'],
  despesasFinanceiras: ['DESPESAS FINANCEIRAS'],
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
  const ticketMedio = numeroVendas ? faturamento / numeroVendas : 0
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
    .filter((row) => groupNames.includes(row.totalizadora))
    .reduce((sum, row) => sum + row.valor, 0)
}

function buildGroupDetails(rows: FinanceRow[], groupNames: string[]) {
  const groupRows = rows.filter((row) => groupNames.includes(row.totalizadora))
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
  const gastosVenda = sumByGroup(rows, financeGroups.gastosVenda)
  const gastosPessoal = sumByGroup(rows, financeGroups.gastosPessoal)
  const gastosEstrutura = sumByGroup(rows, financeGroups.gastosEstrutura)
  const investimentos = sumByGroup(rows, financeGroups.investimentos)
  const receitasFinanceiras = sumByGroup(rows, financeGroups.receitasFinanceiras)
  const despesasFinanceiras = sumByGroup(rows, financeGroups.despesasFinanceiras)

  const gastosOperacionaisFixos = gastosPessoal + gastosEstrutura
  const totalDespesas = gastosVenda + gastosOperacionaisFixos + investimentos
  const margemContribuicao = receitaBruta - gastosVenda
  const margemContribuicaoPercentual = receitaBruta ? margemContribuicao / receitaBruta : 0
  const lucroAntesInvestimentos = margemContribuicao - gastosOperacionaisFixos
  const lucroAposInvestimentos = lucroAntesInvestimentos - investimentos
  const saldoLiquidoCaixa = lucroAposInvestimentos + receitasFinanceiras - despesasFinanceiras

  const composition = [
    { label: 'Gastos da venda', value: gastosVenda },
    { label: 'Pessoal', value: gastosPessoal },
    { label: 'Estrutura', value: gastosEstrutura },
    { label: 'Investimentos', value: investimentos },
  ].filter((item) => item.value > 0)

  const dre = [
    createDreRow('receita-operacional', 'Receitas Operacionais', '(+)', receitaBruta, receitaBruta, 'income', buildGroupDetails(rows, financeGroups.receitaBruta)),
    createDreRow('gastos-venda', 'Gastos da Venda', '(-)', gastosVenda, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.gastosVenda)),
    createDreRow('margem-contribuicao', 'Margem de Contribuição', '(=)', margemContribuicao, receitaBruta, 'result'),
    createDreRow('gastos-pessoal', 'Gastos com Pessoal', '(-)', gastosPessoal, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.gastosPessoal)),
    createDreRow('gastos-estrutura', 'Gastos de Estrutura', '(-)', gastosEstrutura, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.gastosEstrutura)),
    createDreRow('lucro-antes-investimentos', 'Lucro Antes dos Investimentos', '(=)', lucroAntesInvestimentos, receitaBruta, 'result'),
    createDreRow('investimentos', 'Investimentos', '(-)', investimentos, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.investimentos)),
    createDreRow('lucro-apos-investimentos', 'Lucro Após Investimentos', '(=)', lucroAposInvestimentos, receitaBruta, 'result'),
    createDreRow('receitas-financeiras', 'Receitas Financeiras', '(+)', receitasFinanceiras, receitaBruta, 'income', buildGroupDetails(rows, financeGroups.receitasFinanceiras)),
    createDreRow('despesas-financeiras', 'Despesas Financeiras', '(-)', despesasFinanceiras, receitaBruta, 'expense', buildGroupDetails(rows, financeGroups.despesasFinanceiras)),
    createDreRow('saldo-liquido', 'Saldo Líquido de Caixa', '(=)', saldoLiquidoCaixa, receitaBruta, 'highlight'),
  ]

  return {
    receitaBruta,
    gastosVenda,
    gastosOperacionaisFixos,
    totalDespesas,
    margemContribuicao,
    margemContribuicaoPercentual,
    lucroAntesInvestimentos,
    lucroAposInvestimentos,
    saldoLiquidoCaixa,
    composition,
    dre,
  }
}
