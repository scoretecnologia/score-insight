import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, Boxes, RotateCcw, Settings2, ShieldCheck, Wallet } from 'lucide-react'

import { ProfileMenu } from '@/components/layout/ProfileMenu'
import { useAuthStore } from '@/store/auth-store'
import { DashboardPeriodFilter } from '@/components/layout/DashboardPeriodFilter'

const navItems = [
  { to: '/dashboard', label: 'Geral', icon: BarChart3, end: true },
  { to: '/dashboard/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/dashboard/vendas', label: 'Vendas', icon: ShieldCheck },
  { to: '/dashboard/estoque', label: 'Estoque', icon: Boxes },
]

export function AppShell() {
  const profile = useAuthStore((state) => state.profile)
  const isImpersonating = useAuthStore((state) => state.isImpersonating)
  const impersonationSource = useAuthStore((state) => state.impersonationSource)
  const restoreOriginalUser = useAuthStore((state) => state.restoreOriginalUser)
  const computedNavItems =
    profile?.role === 'admin'
      ? [...navItems, { to: '/dashboard/configuracoes', label: 'Configurações', icon: Settings2 }]
      : navItems

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        {isImpersonating ? (
          <div className="mb-4 flex flex-col gap-3 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.25)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-amber-600">Modo de simulação</p>
              <p className="mt-1 text-sm">
                Você está navegando como outro usuário. Volte para <strong>{impersonationSource?.fullName ?? 'o usuário original'}</strong> quando terminar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void restoreOriginalUser()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-700 transition hover:border-amber-400 hover:bg-amber-100"
            >
              <RotateCcw className="size-4" />
              Voltar para {impersonationSource?.fullName ?? 'usuário original'}
            </button>
          </div>
        ) : null}

        <header className="relative z-30 rounded-[30px] border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.28)] backdrop-blur">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://lunsyufvxkiivnrhpxpj.supabase.co/storage/v1/object/public/utils/logo_simples.png"
                alt="Score"
                className="h-12 w-auto object-contain"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-emerald-600">Score Insight</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900">Painel operacional</h1>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 p-1.5 shadow-inner shadow-slate-200/70">
              {computedNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                        isActive
                          ? 'border-emerald-300 bg-white text-emerald-600 shadow-[0_8px_18px_-12px_rgba(0,193,110,0.7)]'
                          : 'border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-800',
                      ].join(' ')
                    }
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>

            <ProfileMenu />
          </div>
        </header>

        <DashboardPeriodFilter />

        <main className="flex-1 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
