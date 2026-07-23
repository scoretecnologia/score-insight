import { supabase } from '@/lib/supabase'
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

async function invokeFunction<T>(slug: string, fallbackAccessToken: string, query?: Record<string, string | number>) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const accessToken = session?.access_token || fallbackAccessToken

  if (!accessToken) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

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
    let message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `Falha ao carregar ${slug}.`

    if (message.includes('Nao foi possivel validar o usuario autenticado') || message.includes('Token de autenticacao ausente')) {
      message = 'Sessão expirada ou inválida. Por favor, recarregue a página ou faça login novamente.'
    }

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

export async function getStockRows(accessToken: string, companyId: string, month?: number, year?: number) {
  const query: Record<string, string | number> = { companyId }
  if (month !== undefined) query.month = month
  if (year !== undefined) query.year = year

  const rows = await invokeFunction<UnknownRecord[]>('formen-stock_new', accessToken, query)

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
    const codVendaVal = pickValue(row, 'Cod Venda', 'cod_venda', 'CodVenda', 'codVenda', 'Código Venda', 'Codigo Venda', 'Cod. Venda')

    if (codVendaVal !== undefined && codVendaVal !== null && codVendaVal !== '') {
      const quantVendida = toNumber(pickValue(row, 'Quant Vendida', 'quant_vendida', 'QuantVendida', 'quantVendida', 'Quantidade', 'quantidade', 'Qtd', 'qtd'))
      const valorUnitario = toNumber(pickValue(row, 'Valor Unitário', 'Valor Unitario', 'valor_unitario', 'valorUnitario', 'Valor Unit', 'valor_unit'))
      const totalVal = pickValue(row, 'Total', 'total', 'Subtotal', 'Sub Total', 'subtotal', 'sub_total', 'Valor Total', 'valor_total')
      const total = totalVal !== undefined ? toNumber(totalVal) : valorUnitario * quantVendida
      const custo = toNumber(pickValue(row, 'Custo', 'custo'))
      const lucro = total - custo

      sales.push({
        id: toNumber(pickValue(row, 'ID', 'id', 'Id')) || index + 1,
        codVenda: toStringValue(codVendaVal),
        descricao: toStringValue(pickValue(row, 'Descrição', 'Descricao', 'descricao', 'item', 'Item', 'Produto', 'produto')),
        quantVendida,
        vendedor: toStringValue(pickValue(row, 'Vendedor', 'vendedor')),
        cliente: toStringValue(pickValue(row, 'Cliente', 'cliente')),
        valorUnitario,
        total,
        custo,
        lucro,
        data: toStringValue(pickValue(row, 'Data', 'data', 'Data Venda', 'data_venda')),
        departamento: toStringValue(pickValue(row, 'Departamento', 'departamento')),
      })

      return
    }

    const dataCadastroVal = pickValue(row, 'data_cadastro', 'Data Cadastro', 'Data de Cadastro', 'dataCadastro', 'DataCadastro', 'data_cadastro_cliente')
    const clienteVal = pickValue(row, 'Cliente', 'cliente')

    if (dataCadastroVal !== undefined || clienteVal !== undefined) {
      customers.push({
        id: toStringValue(pickValue(row, 'id', 'ID', 'Id')) || `cust-${index}`,
        dataCadastro: toStringValue(dataCadastroVal || ''),
        cliente: toStringValue(clienteVal || ''),
      })
    }
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
