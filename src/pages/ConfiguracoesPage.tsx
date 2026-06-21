import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Navigate, useNavigate } from 'react-router-dom'
import { KeyRound, PencilLine, Plus, UserRoundCheck } from 'lucide-react'

import { MetricCard } from '@/components/dashboard/MetricCard'
import { Panel } from '@/components/dashboard/Panel'
import { createManagedUser, impersonateManagedUser, listManagedUsers, updateManagedUser } from '@/lib/admin-api'
import { useAuthStore } from '@/store/auth-store'
import type { AppRole, ManagedUser } from '@/types'

type UserFormState = {
  fullName: string
  email: string
  password: string
  role: AppRole
  companyId: string
}

const initialFormState: UserFormState = {
  fullName: '',
  email: '',
  password: '',
  role: 'user',
  companyId: '',
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Sem registro'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function ConfiguracoesPage() {
  const navigate = useNavigate()
  const profile = useAuthStore((state) => state.profile)
  const accessToken = useAuthStore((state) => state.accessToken)
  const availableCompanies = useAuthStore((state) => state.availableCompanies)
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [form, setForm] = useState<UserFormState>(initialFormState)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [impersonatingUserId, setImpersonatingUserId] = useState('')
  const [confirmImpersonationUser, setConfirmImpersonationUser] = useState<ManagedUser | null>(null)

  const metrics = useMemo(() => {
    const admins = users.filter((user) => user.role === 'admin').length
    const usersByClient = users.filter((user) => user.role === 'user').length

    return {
      total: users.length,
      admins,
      usersByClient,
    }
  }, [users])

  const loadUsers = useCallback(async () => {
    if (!accessToken) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await listManagedUsers(accessToken)
      setUsers(result)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os usuários.')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  function openCreateModal() {
    setEditingUser(null)
    setForm({
      ...initialFormState,
      companyId: availableCompanies[0]?.id ?? '',
    })
    setFormError('')
    setIsModalOpen(true)
  }

  function openEditModal(user: ManagedUser) {
    setEditingUser(user)
    setForm({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      companyId: user.companyId ?? '',
    })
    setFormError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingUser(null)
    setForm(initialFormState)
    setFormError('')
  }

  function updateFormValue<Key extends keyof UserFormState>(key: Key, value: UserFormState[Key]) {
    setForm((current) => {
      const next = { ...current, [key]: value }

      if (key === 'role' && value === 'admin') {
        next.companyId = ''
      }

      if (key === 'role' && value === 'user' && !next.companyId) {
        next.companyId = availableCompanies[0]?.id ?? ''
      }

      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!form.fullName.trim() || !form.email.trim()) {
      setFormError('Informe nome completo e e-mail.')
      return
    }

    if (!editingUser && form.password.trim().length < 6) {
      setFormError('A senha inicial deve ter pelo menos 6 caracteres.')
      return
    }

    if (form.role === 'user' && !form.companyId) {
      setFormError('Selecione o cliente do usuário.')
      return
    }

    setIsSaving(true)

    try {
      if (!accessToken) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      if (editingUser) {
        await updateManagedUser(accessToken, {
          userId: editingUser.id,
          email: form.email,
          fullName: form.fullName,
          role: form.role,
          companyId: form.role === 'user' ? form.companyId : null,
          password: form.password.trim() ? form.password : undefined,
        })
      } else {
        await createManagedUser(accessToken, {
          email: form.email,
          fullName: form.fullName,
          role: form.role,
          companyId: form.role === 'user' ? form.companyId : null,
          password: form.password,
        })
      }

      closeModal()
      await loadUsers()
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Não foi possível salvar o usuário.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleImpersonate(user: ManagedUser) {
    if (!accessToken) {
      setError('Sessão expirada. Faça login novamente.')
      return
    }

    setImpersonatingUserId(user.id)
    setError('')

    try {
      await impersonateManagedUser(accessToken, user.id)
      navigate('/dashboard', { replace: true })
    } catch (impersonateError) {
      setError(impersonateError instanceof Error ? impersonateError.message : 'Não foi possível simular o usuário.')
    } finally {
      setImpersonatingUserId('')
    }
  }

  function openImpersonationConfirm(user: ManagedUser) {
    setConfirmImpersonationUser(user)
  }

  function closeImpersonationConfirm() {
    setConfirmImpersonationUser(null)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Configurações</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Gestão de usuários</h2>
            <p className="mt-2 text-sm text-slate-500">Crie usuários, defina o papel de acesso, vincule clientes e simule o acesso quando precisar validar permissões.</p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <Plus className="size-4" />
            Novo usuário
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total de usuários" value={String(metrics.total)} helper="Contas com acesso ao painel" />
        <MetricCard label="Administradores" value={String(metrics.admins)} helper="Usuários com visão global" />
        <MetricCard label="Usuários por cliente" value={String(metrics.usersByClient)} helper="Contas vinculadas a um cliente" />
      </section>

      <Panel title="Acessos cadastrados" subtitle="Administração central dos usuários do Score Insight">
        {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

        {isLoading ? (
          <div className="text-sm text-slate-500">Carregando usuários...</div>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-slate-200">
            <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)_150px_180px_170px_220px] gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid">
              <span>Nome</span>
              <span>E-mail</span>
              <span>Papel</span>
              <span>Cliente</span>
              <span>Último acesso</span>
              <span className="text-right">Ações</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <div key={user.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)_150px_180px_170px_220px] lg:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                    <p className="mt-1 text-xs text-slate-500">Criado em {formatDateTime(user.createdAt)}</p>
                  </div>

                  <div className="text-sm text-slate-600">{user.email}</div>

                  <div>
                    <span
                      className={[
                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                        user.role === 'admin' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700',
                      ].join(' ')}
                    >
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                  </div>

                  <div className="text-sm text-slate-600">{user.companyName ?? 'Todos os clientes'}</div>
                  <div className="text-sm text-slate-600">{formatDateTime(user.lastSignInAt)}</div>

                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      <PencilLine className="size-4" />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => openImpersonationConfirm(user)}
                      disabled={impersonatingUserId === user.id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <UserRoundCheck className="size-4" />
                      {impersonatingUserId === user.id ? 'Simulando...' : 'Simular'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {isModalOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Usuário</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{editingUser ? 'Editar acesso' : 'Novo acesso'}</h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
              >
                Fechar
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-700">Nome completo</span>
                  <input
                    value={form.fullName}
                    onChange={(event) => updateFormValue('fullName', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
                    placeholder="Nome do usuário"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-700">E-mail</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateFormValue('email', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
                    placeholder="nome@empresa.com"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-700">Papel</span>
                  <select
                    value={form.role}
                    onChange={(event) => updateFormValue('role', event.target.value as AppRole)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
                  >
                    <option value="admin">Administrador</option>
                    <option value="user">Usuário</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-700">Cliente</span>
                  <select
                    value={form.companyId}
                    onChange={(event) => updateFormValue('companyId', event.target.value)}
                    disabled={form.role === 'admin'}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">{form.role === 'admin' ? 'Todos os clientes' : 'Selecione um cliente'}</option>
                    {availableCompanies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.storeName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">{editingUser ? 'Nova senha' : 'Senha inicial'}</span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => updateFormValue('password', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
                    placeholder={editingUser ? 'Deixe em branco para manter a senha atual' : 'Senha com no mínimo 6 caracteres'}
                  />
                </div>
              </label>

              {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{formError}</div> : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? 'Salvando...' : editingUser ? 'Salvar usuário' : 'Criar usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {confirmImpersonationUser
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(15,23,42,0.28)] px-4 backdrop-blur-md">
              <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.45)]">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                    <UserRoundCheck className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Simulação de acesso</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">Entrar como outro usuário</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Você vai assumir temporariamente a sessão de <strong>{confirmImpersonationUser.fullName}</strong> para validar permissões e experiência do usuário.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Usuário</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{confirmImpersonationUser.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">E-mail</p>
                      <p className="mt-1 text-sm text-slate-600">{confirmImpersonationUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Papel</p>
                      <p className="mt-1 text-sm text-slate-600">{confirmImpersonationUser.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cliente</p>
                      <p className="mt-1 text-sm text-slate-600">{confirmImpersonationUser.companyName ?? 'Todos os clientes'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  A sua sessão atual será preservada e um botão de retorno ficará visível no painel para você voltar ao usuário original quando quiser.
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeImpersonationConfirm}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleImpersonate(confirmImpersonationUser)
                      closeImpersonationConfirm()
                    }}
                    disabled={impersonatingUserId === confirmImpersonationUser.id}
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {impersonatingUserId === confirmImpersonationUser.id ? 'Entrando...' : 'Simular acesso'}
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
