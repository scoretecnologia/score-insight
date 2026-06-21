import type { Session, Subscription, User } from '@supabase/supabase-js'
import { create } from 'zustand'

import { supabase } from '@/lib/supabase'
import { useDashboardFilterStore } from '@/store/dashboard-filter-store'
import type { AuthProfile, CompanyScope, LoginInput } from '@/types'

type InsightProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  active: boolean
  empresa_id: string | null
}

type CompanyRow = {
  id: string
  nome_loja: string
  cashtrack_empresa: string | null
  ativo: boolean
}

type StoredImpersonationSession = {
  accessToken: string
  refreshToken: string
  fullName: string
  email: string
}

type AuthState = {
  profile: AuthProfile | null
  availableCompanies: CompanyScope[]
  isAuthenticated: boolean
  isReady: boolean
  isImpersonating: boolean
  impersonationSource: { fullName: string; email: string } | null
  authMessage: string
  accessToken: string
  initialize: () => Promise<void>
  bindAuthListener: () => () => void
  login: (input: LoginInput) => Promise<{ ok: boolean; message?: string }>
  updateCurrentUser: (input: { fullName?: string; password?: string }) => Promise<{ ok: boolean; message?: string }>
  restoreOriginalUser: () => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>
}

let authSubscription: Subscription | null = null
const IMPERSONATION_STORAGE_KEY = 'score-insight-impersonation-session'

function getStoredImpersonationSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.sessionStorage.getItem(IMPERSONATION_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as StoredImpersonationSession
  } catch {
    window.sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY)
    return null
  }
}

function persistImpersonationSession(payload: StoredImpersonationSession) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(payload))
}

function clearImpersonationSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY)
}

function getImpersonationState() {
  const stored = getStoredImpersonationSession()

  return {
    isImpersonating: Boolean(stored),
    impersonationSource: stored
      ? {
          fullName: stored.fullName,
          email: stored.email,
        }
      : null,
  }
}

function resetAuthState(set: (partial: Partial<AuthState>) => void, message = '') {
  useDashboardFilterStore.getState().resetFilters()
  clearImpersonationSession()

  set({
    profile: null,
    availableCompanies: [],
    isAuthenticated: false,
    isReady: true,
    isImpersonating: false,
    impersonationSource: null,
    authMessage: message,
    accessToken: '',
  })
}

function toCompanyScope(company: CompanyRow): CompanyScope {
  return {
    id: company.id,
    storeName: company.nome_loja,
    cashtrackCompany: company.cashtrack_empresa,
    active: company.ativo,
  }
}

function syncDashboardCompany(profile: AuthProfile, companies: CompanyScope[]) {
  const { companyId, setCompanyId } = useDashboardFilterStore.getState()
  const allowedCompanyId = profile.companyId

  if (profile.role !== 'admin') {
    if (allowedCompanyId && companyId !== allowedCompanyId) {
      setCompanyId(allowedCompanyId)
    }

    return
  }

  const hasSelectedCompany = companies.some((company) => company.id === companyId)
  const nextCompanyId = hasSelectedCompany ? companyId : allowedCompanyId || companies[0]?.id || ''

  if (nextCompanyId !== companyId) {
    setCompanyId(nextCompanyId)
  }
}

async function ensureInsightProfile(user: User) {
  const profilePayload = {
    id: user.id,
    email: user.email ?? '',
    full_name:
      typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
        ? user.user_metadata.full_name.trim()
        : user.email?.split('@')[0] ?? 'Usuário Score',
    active: true,
    empresa_id: null,
  }

  const { data, error } = await supabase.from('insight_profiles').select('id, email, full_name, active, empresa_id').eq('id', user.id).maybeSingle()

  if (error) {
    throw new Error(`Não foi possível validar insight_profiles: ${error.message}`)
  }

  if (data) {
    return data as InsightProfileRow
  }

  const { error: insertError } = await supabase.from('insight_profiles').upsert(profilePayload)

  if (insertError) {
    throw new Error(`Não foi possível criar o perfil do usuário em insight_profiles: ${insertError.message}`)
  }

  return profilePayload satisfies InsightProfileRow
}

async function loadAuthProfile(session: Session) {
  const insightProfile = await ensureInsightProfile(session.user)

  const { data: roleRow, error: roleError } = await supabase
    .from('insight_user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (roleError) {
    throw new Error(`Não foi possível validar insight_user_roles: ${roleError.message}`)
  }

  if (!roleRow?.role) {
    throw new Error('Usuário autenticado, mas sem papel vinculado em insight_user_roles.')
  }

  if (!insightProfile.active) {
    throw new Error('Usuário inativo em insight_profiles.')
  }

  let availableCompanies: CompanyScope[] = []
  let linkedCompany: CompanyScope | null = null

  if (roleRow.role === 'admin') {
    const { data: companies, error: companiesError } = await supabase
      .from('gigatech_clientes_config')
      .select('id, nome_loja, cashtrack_empresa, ativo')
      .eq('ativo', true)
      .order('nome_loja', { ascending: true })

    if (companiesError) {
      throw new Error(`Não foi possível carregar as empresas ativas: ${companiesError.message}`)
    }

    availableCompanies = (companies ?? []).map((company) => toCompanyScope(company as CompanyRow))
  } else {
    if (!insightProfile.empresa_id) {
      throw new Error('Usuário sem empresa vinculada em insight_profiles.')
    }

    const { data: company, error: companyError } = await supabase
      .from('gigatech_clientes_config')
      .select('id, nome_loja, cashtrack_empresa, ativo')
      .eq('id', insightProfile.empresa_id)
      .eq('ativo', true)
      .maybeSingle()

    if (companyError) {
      throw new Error(`Não foi possível carregar a empresa vinculada: ${companyError.message}`)
    }

    if (!company) {
      throw new Error('A empresa vinculada ao usuário não está ativa ou não foi encontrada.')
    }

    linkedCompany = toCompanyScope(company as CompanyRow)
    availableCompanies = [linkedCompany]
  }

  if (roleRow.role === 'admin' && availableCompanies.length === 0) {
    throw new Error('Nenhuma empresa ativa foi encontrada para administração.')
  }

  if (!linkedCompany && insightProfile.empresa_id) {
    linkedCompany = availableCompanies.find((company) => company.id === insightProfile.empresa_id) ?? null
  }

  return {
    profile: {
      id: insightProfile.id,
      email: insightProfile.email ?? session.user.email ?? '',
      fullName: insightProfile.full_name ?? session.user.email ?? 'Usuário Score',
      active: insightProfile.active,
      role: roleRow.role,
      companyId: linkedCompany?.id ?? insightProfile.empresa_id ?? null,
      companyName: linkedCompany?.storeName ?? null,
    } satisfies AuthProfile,
    availableCompanies,
  }
}

function toFriendlyAuthMessage(message: string) {
  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'Credenciais inválidas.'
  }

  return message
}

export const useAuthStore = create<AuthState>()((set) => ({
  profile: null,
  availableCompanies: [],
  isAuthenticated: false,
  isReady: false,
  ...getImpersonationState(),
  authMessage: '',
  accessToken: '',
  initialize: async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      if (!session) {
        resetAuthState(set)
        return
      }

      const { profile, availableCompanies } = await loadAuthProfile(session)
      syncDashboardCompany(profile, availableCompanies)

      set({
        profile,
        availableCompanies,
        isAuthenticated: true,
        isReady: true,
        ...getImpersonationState(),
        authMessage: '',
        accessToken: session.access_token,
      })
    } catch (error) {
      await supabase.auth.signOut()
      resetAuthState(set, error instanceof Error ? error.message : 'Não foi possível iniciar a sessão.')
    }
  },
  bindAuthListener: () => {
    authSubscription?.unsubscribe()

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        resetAuthState(set)
        return
      }

      try {
        const { profile, availableCompanies } = await loadAuthProfile(session)
        syncDashboardCompany(profile, availableCompanies)

        set({
          profile,
          availableCompanies,
          isAuthenticated: true,
          isReady: true,
          ...getImpersonationState(),
          authMessage: '',
          accessToken: session.access_token,
        })
      } catch (error) {
        await supabase.auth.signOut()
        resetAuthState(set, error instanceof Error ? error.message : 'Não foi possível validar o acesso.')
      }
    })

    authSubscription = data.subscription

    return () => {
      authSubscription?.unsubscribe()
      authSubscription = null
    }
  },
  login: async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        return { ok: false, message: toFriendlyAuthMessage(error.message) }
      }

      if (!data.session) {
        return { ok: false, message: 'Não foi possível iniciar a sessão.' }
      }

      const { profile, availableCompanies } = await loadAuthProfile(data.session)
      syncDashboardCompany(profile, availableCompanies)

      set({
        profile,
        availableCompanies,
        isAuthenticated: true,
        isReady: true,
        ...getImpersonationState(),
        authMessage: '',
        accessToken: data.session.access_token,
      })

      return { ok: true }
    } catch (error) {
      await supabase.auth.signOut()
      const message = error instanceof Error ? error.message : 'Não foi possível entrar.'
      resetAuthState(set, message)
      return { ok: false, message }
    }
  },
  updateCurrentUser: async ({ fullName, password }) => {
    const trimmedFullName = fullName?.trim()

    if (!trimmedFullName && !password) {
      return { ok: false, message: 'Informe ao menos um dado para atualizar.' }
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (!session) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      const updates: Parameters<typeof supabase.auth.updateUser>[0] = {}

      if (trimmedFullName) {
        updates.data = { full_name: trimmedFullName }
      }

      if (password) {
        if (password.length < 6) {
          return { ok: false, message: 'A senha deve ter pelo menos 6 caracteres.' }
        }

        updates.password = password
      }

      const { error: updateError } = await supabase.auth.updateUser(updates)

      if (updateError) {
        throw updateError
      }

      if (trimmedFullName) {
        const { error: profileError } = await supabase
          .from('insight_profiles')
          .update({ full_name: trimmedFullName, updated_at: new Date().toISOString() })
          .eq('id', session.user.id)

        if (profileError) {
          throw profileError
        }
      }

      const {
        data: { session: refreshedSession },
        error: refreshError,
      } = await supabase.auth.getSession()

      if (refreshError) {
        throw refreshError
      }

      if (!refreshedSession) {
        throw new Error('Não foi possível atualizar a sessão após salvar os dados.')
      }

      const { profile, availableCompanies } = await loadAuthProfile(refreshedSession)
      syncDashboardCompany(profile, availableCompanies)

      set({
        profile,
        availableCompanies,
        isAuthenticated: true,
        isReady: true,
        ...getImpersonationState(),
        authMessage: '',
        accessToken: refreshedSession.access_token,
      })

      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Não foi possível atualizar os dados do perfil.',
      }
    }
  },
  restoreOriginalUser: async () => {
    try {
      const stored = getStoredImpersonationSession()

      if (!stored) {
        return { ok: false, message: 'Nenhuma sessão original foi encontrada para restaurar.' }
      }

      const { error } = await supabase.auth.setSession({
        access_token: stored.accessToken,
        refresh_token: stored.refreshToken,
      })

      if (error) {
        throw error
      }

      clearImpersonationSession()
      set({
        ...getImpersonationState(),
      })

      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Não foi possível restaurar o usuário original.',
      }
    }
  },
  logout: async () => {
    await supabase.auth.signOut()
    resetAuthState(set)
  },
}))

export function storeOriginalSessionForImpersonation(session: Session, profile: AuthProfile | null) {
  const refreshToken = session.refresh_token

  if (!refreshToken) {
    throw new Error('Não foi possível guardar a sessão atual para restauração.')
  }

  persistImpersonationSession({
    accessToken: session.access_token,
    refreshToken,
    fullName: profile?.fullName ?? session.user.email ?? 'Usuário original',
    email: profile?.email ?? session.user.email ?? '',
  })
}
