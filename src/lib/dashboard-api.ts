import type { FinanceRow, NewCustomerRow, SalesRow, StockRow } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

type UnknownRecord = Record<string, unknown>

function getFunctionUrl(slug: string, query?: Record<string, string | number>) {
  const search = new URLSearchParams()

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      search.set(key, String(value))
    })
  }

  const queryString = search.toString()
  return `${supabaseUrl}/functions/v1/${slug}${queryString ? `?${queryString}` : ''}`
}

async function invokeFunction<T>(slug: string, accessToken: string, query?: Record<string, string | number>) {
  const response = await fetch(getFunctionUrl(slug, query), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseKey,
      'Content-Type': 'application/json',
    },
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as T | { error?: string }) : null

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `Falha ao carregar ${slug}.`
    throw new Error(message)
  }

  return data as T
}

function toNumber(value: unknown) {
  return Number(value) || 0
}

function toStringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function pickValue(row: UnknownRecord, ...keys: string[]) {
  for (const key of keys) {
    if (key in row) {
      return row[key]
    }
  }

  return undefined
}

export async function getStockRows(accessToken: string, companyId: string) {
  const rows = await invokeFunction<UnknownRecord[]>('formen-stock_new', accessToken, { companyId })

  return rows.map((row) => ({
    codigo: toNumber(row.Codigo),
    ean: toStringValue(row.EAN),
    descricao: toStringValue(row.Descricao),
    marca: toStringValue(row.Marca),
    cor: toStringValue(row.Cor),
    departamento: toStringValue(row.Departamento),
    custo: toNumber(row.Custo),
    valorVenda: toNumber(row['Valor de Venda']),
    quantidade: toNumber(row.Quantidade),
  })) satisfies StockRow[]
}

export async function getSalesData(accessToken: string, companyId: string) {
  const rows = await invokeFunction<UnknownRecord[]>('formen-sales_new', accessToken, { companyId })

  const sales: SalesRow[] = []
  const customers: NewCustomerRow[] = []

  rows.forEach((row, index) => {
    if ('Cod Venda' in row) {
      const quantVendida = toNumber(row['Quant Vendida'])
      const valorUnitario = toNumber(pickValue(row, 'Valor Unitário', 'Valor Unitario'))
      const total = valorUnitario * quantVendida
      const custo = toNumber(row.Custo)
      const lucro = total - custo

      sales.push({
        id: toNumber(row.ID) || index + 1,
        codVenda: toStringValue(row['Cod Venda']),
        descricao: toStringValue(pickValue(row, 'Descrição', 'Descricao')),
        quantVendida,
        vendedor: toStringValue(row.Vendedor),
        cliente: toStringValue(row.Cliente),
        valorUnitario,
        total,
        custo,
        lucro,
        data: toStringValue(row.Data),
        departamento: toStringValue(row.Departamento),
      })

      return
    }

    customers.push({
      id: toStringValue(row.id),
      dataCadastro: toStringValue(row.data_cadastro),
      cliente: toStringValue(row.Cliente),
    })
  })

  return { sales, customers }
}

export async function getFinanceRows(accessToken: string, month: number, year: number, companyId: string) {
  const rows = await invokeFunction<UnknownRecord[]>('cashtrack-finance-new', accessToken, { month, year, companyId })

  return rows.map((row) => ({
    totalizadora: toStringValue(row.Totalizadora),
    subconta: toStringValue(row.Subconta),
    dataLancamento: toStringValue(row.data_lancamento),
    valor: toNumber(row.valor),
    detalhes: toStringValue(row.detalhes),
  })) satisfies FinanceRow[]
}
