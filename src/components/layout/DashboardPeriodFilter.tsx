import { useEffect, useMemo } from 'react'
import { Building2, CalendarDays, ChevronDown } from 'lucide-react'

import { useAuthStore } from '@/store/auth-store'
import { useDashboardFilterStore } from '@/store/dashboard-filter-store'

const MIN_YEAR = 2026

const monthOptions = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

function getYearOptions() {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, index) => MIN_YEAR + index)
}

export function DashboardPeriodFilter() {
  const currentDate = useMemo(() => new Date(), [])
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const profile = useAuthStore((state) => state.profile)
  const availableCompanies = useAuthStore((state) => state.availableCompanies)
  const companyId = useDashboardFilterStore((state) => state.companyId)
  const month = useDashboardFilterStore((state) => state.month)
  const year = useDashboardFilterStore((state) => state.year)
  const setCompanyId = useDashboardFilterStore((state) => state.setCompanyId)
  const setMonth = useDashboardFilterStore((state) => state.setMonth)
  const setYear = useDashboardFilterStore((state) => state.setYear)
  const yearOptions = useMemo(() => getYearOptions(), [])
  const currentCompany = useMemo(
    () => availableCompanies.find((company) => company.id === companyId) ?? null,
    [availableCompanies, companyId]
  )
  const availableMonths = useMemo(() => {
    if (year < currentYear) {
      return monthOptions
    }

    return monthOptions.filter((item) => item.value <= currentMonth)
  }, [currentMonth, currentYear, year])

  useEffect(() => {
    if (!profile) {
      return
    }

    if (profile.role === 'user') {
      const nextCompanyId = profile.companyId ?? ''

      if (companyId !== nextCompanyId) {
        setCompanyId(nextCompanyId)
      }

      return
    }

    if (!availableCompanies.some((company) => company.id === companyId)) {
      setCompanyId(availableCompanies[0]?.id ?? '')
    }
  }, [availableCompanies, companyId, profile, setCompanyId])

  useEffect(() => {
    if (year < MIN_YEAR) {
      setYear(MIN_YEAR)
      return
    }

    if (year > currentYear) {
      setYear(currentYear)
    }
  }, [currentYear, setYear, year])

  useEffect(() => {
    const maxAllowedMonth = availableMonths[availableMonths.length - 1]?.value ?? currentMonth

    if (month > maxAllowedMonth) {
      setMonth(maxAllowedMonth)
    }
  }, [availableMonths, currentMonth, month, setMonth])

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.28)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-slate-900">
        <div className="rounded-2xl bg-rose-50 p-2.5 text-rose-500">
          <Building2 className="size-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Filtros globais</p>
          <span className="text-lg font-semibold">
            {currentCompany?.storeName ?? profile?.companyName ?? 'Selecione a empresa'} · {monthOptions.find((item) => item.value === month)?.label} {year}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {profile?.role === 'admin' ? (
          <label className="relative">
            <span className="sr-only">Selecionar empresa</span>
            <select
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
              className="min-w-[220px] appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
            >
              {availableCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.storeName}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </label>
        ) : (
          <div className="inline-flex min-w-[220px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
            <CalendarDays className="size-4 text-slate-400" />
            <span className="truncate">{currentCompany?.storeName ?? profile?.companyName ?? 'Empresa vinculada'}</span>
          </div>
        )}

        <label className="relative">
          <span className="sr-only">Selecionar mês</span>
          <select
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="min-w-[140px] appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
          >
            {availableMonths.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        </label>

        <label className="relative">
          <span className="sr-only">Selecionar ano</span>
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="min-w-[110px] appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
          >
            {yearOptions.map((optionYear) => (
              <option key={optionYear} value={optionYear}>
                {optionYear}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        </label>
      </div>
    </div>
  )
}
