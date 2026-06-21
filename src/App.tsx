import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import ConfiguracoesPage from '@/pages/ConfiguracoesPage'
import DashboardHome from '@/pages/DashboardHome'
import EstoquePage from '@/pages/EstoquePage'
import FinanceiroPage from '@/pages/FinanceiroPage'
import Login from '@/pages/Login'
import VendasPage from '@/pages/VendasPage'
import { useAuthStore } from '@/store/auth-store'

export default function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const bindAuthListener = useAuthStore((state) => state.bindAuthListener)

  useEffect(() => {
    void initialize()
    return bindAuthListener()
  }, [bindAuthListener, initialize])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<AppShell />}>
            <Route index element={<DashboardHome />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
            <Route path="financeiro" element={<FinanceiroPage />} />
            <Route path="vendas" element={<VendasPage />} />
            <Route path="estoque" element={<EstoquePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
