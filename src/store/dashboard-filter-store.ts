import { create } from 'zustand'

type DashboardFilterState = {
  companyId: string
  month: number
  year: number
  setCompanyId: (companyId: string) => void
  setMonth: (month: number) => void
  setYear: (year: number) => void
  resetFilters: () => void
}

const now = new Date()

export const useDashboardFilterStore = create<DashboardFilterState>((set) => ({
  companyId: '',
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  setCompanyId: (companyId) => set({ companyId }),
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
  resetFilters: () =>
    set({
      companyId: '',
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
}))
