export type AppRole = 'admin' | 'user'

export type CompanyScope = {
  id: string
  storeName: string
  cashtrackCompany: string | null
  active: boolean
}

export type AuthProfile = {
  id: string
  email: string
  fullName: string
  active: boolean
  role: AppRole
  companyId: string | null
  companyName: string | null
}

export type ManagedUser = {
  id: string
  email: string
  fullName: string
  role: AppRole
  companyId: string | null
  companyName: string | null
  active: boolean
  createdAt: string | null
  lastSignInAt: string | null
}

export type LoginInput = {
  email: string
  password: string
}

export type StockRow = {
  codigo: number
  ean: string
  descricao: string
  marca: string
  cor: string
  departamento: string
  custo: number
  valorVenda: number
  quantidade: number
}

export type SalesRow = {
  id: number
  codVenda: string
  descricao: string
  quantVendida: number
  vendedor: string
  cliente: string
  valorUnitario: number
  total: number
  custo: number
  lucro: number
  data: string
  departamento: string
}

export type NewCustomerRow = {
  id: string
  dataCadastro: string
  cliente: string
}

export type FinanceRow = {
  totalizadora: string
  subconta: string
  dataLancamento: string
  valor: number
  detalhes: string
}

export type FinanceDreDetailRow = {
  label: string
  value: number
  participation: number
}

export type FinanceDreRow = {
  id: string
  label: string
  prefix: '(+)' | '(-)' | '(=)'
  value: number
  verticalAnalysis: number
  variant: 'income' | 'expense' | 'result' | 'highlight'
  details: FinanceDreDetailRow[]
}
