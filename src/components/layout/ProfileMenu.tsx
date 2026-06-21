import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CircleUserRound, LogOut, PencilLine } from 'lucide-react'

import { useAuthStore } from '@/store/auth-store'

export function ProfileMenu() {
  const profile = useAuthStore((state) => state.profile)
  const logout = useAuthStore((state) => state.logout)
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fullName, setFullName] = useState(profile?.fullName ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const initials = useMemo(() => {
    const source = profile?.fullName?.trim() || profile?.email || 'U'
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }, [profile?.email, profile?.fullName])

  useEffect(() => {
    setFullName(profile?.fullName ?? '')
  }, [profile?.fullName])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function openProfileModal() {
    setError('')
    setPassword('')
    setConfirmPassword('')
    setFullName(profile?.fullName ?? '')
    setIsOpen(false)
    setIsModalOpen(true)
  }

  async function handleSave() {
    setError('')

    if (password && password !== confirmPassword) {
      setError('A confirmação de senha precisa ser igual à nova senha.')
      return
    }

    setIsSaving(true)
    const result = await updateCurrentUser({
      fullName,
      password: password || undefined,
    })
    setIsSaving(false)

    if (!result.ok) {
      setError(result.message || 'Não foi possível atualizar o perfil.')
      return
    }

    setIsModalOpen(false)
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.35)] transition hover:border-emerald-300 hover:text-emerald-600"
      >
        <span className="sr-only">Abrir perfil</span>
        {initials || <CircleUserRound className="size-5" />}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-14 z-20 w-72 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_24px_50px_-26px_rgba(15,23,42,0.35)]">
          <div className="border-b border-slate-100 pb-3">
            <p className="text-sm font-semibold text-slate-950">{profile?.fullName}</p>
            <p className="mt-1 text-sm text-slate-500">{profile?.email}</p>
          </div>

          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={openProfileModal}
              className="inline-flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <PencilLine className="size-4" />
              Editar perfil
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex w-full items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </div>
        </div>
      ) : null}

      {isModalOpen
        ? createPortal(
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(15,23,42,0.28)] px-4 backdrop-blur-md">
              <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.45)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Perfil</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">Minha conta</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                  >
                    Fechar
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-700">Nome completo</span>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
                      placeholder="Nome do usuário"
                    />
                  </label>

                  <div>
                    <span className="mb-2 block text-sm text-slate-700">E-mail</span>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">{profile?.email}</div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-700">Nova senha</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
                      placeholder="Deixe em branco para manter a senha atual"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-700">Confirmar nova senha</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
                      placeholder="Repita a nova senha"
                    />
                  </label>

                  {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
