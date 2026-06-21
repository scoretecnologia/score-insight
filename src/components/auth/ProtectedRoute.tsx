import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/store/auth-store'

export function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isReady = useAuthStore((state) => state.isReady)

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.2)]">
          Validando sessao...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
