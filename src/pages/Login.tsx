import { FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail } from 'lucide-react'

import { useAuthStore } from '@/store/auth-store'

type LocationState = {
  from?: string
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isReady = useAuthStore((state) => state.isReady)
  const authMessage = useAuthStore((state) => state.authMessage)
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-600">
        Validando sessão...
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const result = await login({ email, password })

    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.message || 'Não foi possível entrar.')
      return
    }

    const state = location.state as LocationState | null
    navigate(state?.from || '/dashboard', { replace: true })
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-900">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="https://pub-b2b30f370a3947899854a061170643ea.r2.dev/utils/score.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[rgba(255,255,255,0.72)] backdrop-blur-[1px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1600px] items-center gap-5 lg:grid-cols-[1.15fr_0.85fr] xl:gap-8 2xl:max-w-[1720px]">
        <section className="flex flex-col gap-8 rounded-[32px] border border-white/90 bg-[rgba(255,255,255,0.88)] p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.3)] backdrop-blur-md lg:p-7">
          <div>
            <img
              src="https://lunsyufvxkiivnrhpxpj.supabase.co/storage/v1/object/public/utils/logo_completa.png"
              alt="Score"
              className="mx-auto h-[72px] w-auto object-contain"
            />
            <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Um cockpit executivo para financeiro, vendas e estoque.
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Módulo</p>
              <p className="mt-3 text-lg font-medium text-slate-900">Financeiro</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Módulo</p>
              <p className="mt-3 text-lg font-medium text-slate-900">Vendas</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Módulo</p>
              <p className="mt-3 text-lg font-medium text-slate-900">Estoque</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/90 bg-[rgba(255,255,255,0.9)] p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.3)] backdrop-blur-md lg:p-7">
          <div className="max-w-md">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Acesso ao sistema</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Entrar</h2>
            <p className="mt-3 text-sm text-slate-500">
              Entre com seu acesso para visualizar os indicadores do painel.
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">E-mail</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-300 focus-within:bg-white">
                <Mail className="size-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="nome@empresa.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Senha</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-300 focus-within:bg-white">
                <LockKeyhole className="size-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Sua senha"
                />
              </div>
            </label>

            {error || authMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error || authMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar no Score Insight'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
