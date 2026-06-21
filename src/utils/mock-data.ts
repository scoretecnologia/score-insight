import type { AuthProfile, FinanceRow, NewCustomerRow, SalesRow, StockRow } from '@/types'

type DemoAccount = {
  password: string
  profile: AuthProfile
}

export const demoAccounts: Record<string, DemoAccount> = {
  'admin@scoreinsight.local': {
    password: 'admin123',
    profile: {
      id: 'usr-admin',
      email: 'admin@scoreinsight.local',
      fullName: 'Administrador Insight',
      active: true,
      role: 'admin',
      companyId: 'demo-for-men',
      companyName: 'For Men Prime',
    },
  },
  'operacao@scoreinsight.local': {
    password: 'user123',
    profile: {
      id: 'usr-operacao',
      email: 'operacao@scoreinsight.local',
      fullName: 'Operacao Score',
      active: true,
      role: 'user',
      companyId: 'demo-for-men',
      companyName: 'For Men Prime',
    },
  },
}

export const stockRows: StockRow[] = [
  { codigo: 1, ean: '789100000001', descricao: 'Camisa Linho Slim', marca: 'Score Cliente', cor: 'Preto', departamento: 'Camisas', custo: 82, valorVenda: 189.9, quantidade: 18 },
  { codigo: 2, ean: '789100000002', descricao: 'Calca Chino Premium', marca: 'Score Cliente', cor: 'Bege', departamento: 'Calcas', custo: 96, valorVenda: 229.9, quantidade: 14 },
  { codigo: 3, ean: '789100000003', descricao: 'Polo Essential', marca: 'Score Cliente', cor: 'Branco', departamento: 'Polos', custo: 52, valorVenda: 129.9, quantidade: 26 },
  { codigo: 4, ean: '789100000004', descricao: 'Blazer Signature', marca: 'Score Cliente', cor: 'Marinho', departamento: 'Blazers', custo: 210, valorVenda: 489.9, quantidade: 7 },
  { codigo: 5, ean: '789100000005', descricao: 'Tenis Casual Urban', marca: 'Score Cliente', cor: 'Cinza', departamento: 'Calcados', custo: 118, valorVenda: 259.9, quantidade: 11 },
  { codigo: 6, ean: '789100000006', descricao: 'Cinto Couro Classic', marca: 'Score Cliente', cor: 'Cafe', departamento: 'Acessorios', custo: 38, valorVenda: 89.9, quantidade: 32 },
  { codigo: 7, ean: '789100000007', descricao: 'Bermuda Sarja Weekend', marca: 'Score Cliente', cor: 'Azul', departamento: 'Bermudas', custo: 48, valorVenda: 119.9, quantidade: 16 },
  { codigo: 8, ean: '789100000008', descricao: 'Jaqueta Tech Comfort', marca: 'Score Cliente', cor: 'Grafite', departamento: 'Jaquetas', custo: 160, valorVenda: 359.9, quantidade: 6 },
]

export const salesRows: SalesRow[] = [
  { id: 1, codVenda: 'V-14021', descricao: 'Camisa Linho Slim', quantVendida: 2, vendedor: 'Lucas', cliente: 'Carlos Mendes', valorUnitario: 189.9, total: 379.8, custo: 164, lucro: 215.8, data: '2026-06-02', departamento: 'Camisas' },
  { id: 2, codVenda: 'V-14022', descricao: 'Polo Essential', quantVendida: 3, vendedor: 'Bianca', cliente: 'Rafael Souza', valorUnitario: 129.9, total: 389.7, custo: 156, lucro: 233.7, data: '2026-06-03', departamento: 'Polos' },
  { id: 3, codVenda: 'V-14023', descricao: 'Calca Chino Premium', quantVendida: 1, vendedor: 'Lucas', cliente: 'Andre Lima', valorUnitario: 229.9, total: 229.9, custo: 96, lucro: 133.9, data: '2026-06-05', departamento: 'Calcas' },
  { id: 4, codVenda: 'V-14024', descricao: 'Tenis Casual Urban', quantVendida: 2, vendedor: 'Marina', cliente: 'Felipe Rocha', valorUnitario: 259.9, total: 519.8, custo: 236, lucro: 283.8, data: '2026-06-08', departamento: 'Calcados' },
  { id: 5, codVenda: 'V-14025', descricao: 'Blazer Signature', quantVendida: 1, vendedor: 'Marina', cliente: 'Henrique Alves', valorUnitario: 489.9, total: 489.9, custo: 210, lucro: 279.9, data: '2026-06-11', departamento: 'Blazers' },
  { id: 6, codVenda: 'V-14026', descricao: 'Cinto Couro Classic', quantVendida: 4, vendedor: 'Bianca', cliente: 'Igor Nunes', valorUnitario: 89.9, total: 359.6, custo: 152, lucro: 207.6, data: '2026-06-13', departamento: 'Acessorios' },
  { id: 7, codVenda: 'V-14027', descricao: 'Bermuda Sarja Weekend', quantVendida: 2, vendedor: 'Lucas', cliente: 'Thiago Reis', valorUnitario: 119.9, total: 239.8, custo: 96, lucro: 143.8, data: '2026-06-14', departamento: 'Bermudas' },
  { id: 8, codVenda: 'V-14028', descricao: 'Jaqueta Tech Comfort', quantVendida: 1, vendedor: 'Marina', cliente: 'Bruno Faria', valorUnitario: 359.9, total: 359.9, custo: 160, lucro: 199.9, data: '2026-06-15', departamento: 'Jaquetas' },
]

export const newCustomerRows: NewCustomerRow[] = [
  { id: 'cli-1', dataCadastro: '2026-06-02', cliente: 'Carlos Mendes' },
  { id: 'cli-2', dataCadastro: '2026-06-05', cliente: 'Andre Lima' },
  { id: 'cli-3', dataCadastro: '2026-06-08', cliente: 'Felipe Rocha' },
  { id: 'cli-4', dataCadastro: '2026-06-15', cliente: 'Bruno Faria' },
]

export const financeRows: FinanceRow[] = [
  { totalizadora: 'VENDAS', subconta: 'Credito', dataLancamento: '2026-06-02', valor: 42100, detalhes: 'Recebimento em cartao' },
  { totalizadora: 'VENDAS', subconta: 'Debito', dataLancamento: '2026-06-05', valor: 18800, detalhes: 'Recebimento em debito' },
  { totalizadora: 'RECEBIMENTO TOTAL', subconta: 'Pix', dataLancamento: '2026-06-08', valor: 25400, detalhes: 'Recebimento em pix' },
  { totalizadora: 'CUSTOS COM FORNECEDORES (-)', subconta: 'Reposicao de colecao', dataLancamento: '2026-06-06', valor: 22100, detalhes: 'Compra de mercadoria' },
  { totalizadora: 'CUSTOS TRIBUTARIOS E FINANCEIROS (-)', subconta: 'Taxas de cartao', dataLancamento: '2026-06-11', valor: 4200, detalhes: 'Taxas operacionais' },
  { totalizadora: 'FRETES E ENTREGAS (-)', subconta: 'Motoboy e transportadora', dataLancamento: '2026-06-12', valor: 2900, detalhes: 'Entrega local e regional' },
  { totalizadora: 'DESPESAS COM PESSOAL (-)', subconta: 'Folha comercial', dataLancamento: '2026-06-07', valor: 15400, detalhes: 'Equipe de vendas' },
  { totalizadora: 'DESPESAS ADMINISTRATIVAS (-)', subconta: 'Aluguel', dataLancamento: '2026-06-09', valor: 8900, detalhes: 'Loja fisica' },
  { totalizadora: 'DESPESAS FINANCEIRAS FIXAS (-)', subconta: 'Sistemas', dataLancamento: '2026-06-10', valor: 1850, detalhes: 'Ferramentas operacionais' },
  { totalizadora: 'INVESTIMENTOS EM MARKETING (-)', subconta: 'Midia paga', dataLancamento: '2026-06-04', valor: 6800, detalhes: 'Campanha de performance' },
  { totalizadora: 'RECEITAS FINANCEIRAS', subconta: 'Rendimento de conta', dataLancamento: '2026-06-18', valor: 430, detalhes: 'Aplicacao automatica' },
  { totalizadora: 'DESPESAS FINANCEIRAS', subconta: 'Juros bancarios', dataLancamento: '2026-06-19', valor: 390, detalhes: 'Juros e tarifas' },
]
