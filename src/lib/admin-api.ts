import { supabase } from '@/lib/supabase'
import { useAuthStore, storeOriginalSessionForImpersonation } from '@/store/auth-store'
import type { AppRole, ManagedUser } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

type AdminFunctionResponse<T> = T | { error?: string }

type ManageUsersPayload = {
  action: string
  [key: string]: unknown
}

type UpsertManagedUserInput = {
  userId?: string
  email: string
  fullName: string
  role: AppRole
  companyId: string | null
  password?: string
}

function getManageUsersUrl() {
  return `${supabaseUrl}/functions/v1/manage-users-new`
}

async function invokeManageUsers<T>(fallbackAccessToken: string, payload: ManageUsersPayload) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const accessToken = session?.access_token || fallbackAccessToken

  if (!accessToken) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  const response = await fetch(getManageUsersUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as AdminFunctionResponse<T>) : null

  if (!response.ok) {
    let message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Falha ao executar a administração de usuários.'

    if (message.includes('Nao foi possivel validar o usuario autenticado') || message.includes('Token de autenticacao ausente')) {
      message = 'Sessão expirada ou inválida. Por favor, recarregue a página ou faça login novamente.'
    }

    throw new Error(message)
  }

  return data as T
}

export async function listManagedUsers(accessToken: string) {
  const data = await invokeManageUsers<{ users: ManagedUser[] }>(accessToken, {
    action: 'list_users',
  })

  return data.users
}

export async function createManagedUser(accessToken: string, input: UpsertManagedUserInput) {
  return invokeManageUsers<{ ok: true; id: string }>(accessToken, {
    action: 'create_user',
    email: input.email,
    password: input.password,
    full_name: input.fullName,
    role: input.role,
    company_id: input.companyId,
  })
}

export async function updateManagedUser(accessToken: string, input: UpsertManagedUserInput) {
  if (!input.userId) {
    throw new Error('Usuário inválido para atualização.')
  }

  return invokeManageUsers<{ ok: true }>(accessToken, {
    action: 'update_user',
    user_id: input.userId,
    email: input.email,
    password: input.password,
    full_name: input.fullName,
    role: input.role,
    company_id: input.companyId,
  })
}

export async function impersonateManagedUser(accessToken: string, userId: string) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  if (!session) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  storeOriginalSessionForImpersonation(session, useAuthStore.getState().profile)

  const data = await invokeManageUsers<{ tokenHash: string }>(accessToken, {
    action: 'impersonate_user',
    user_id: userId,
  })

  const { error } = await supabase.auth.verifyOtp({
    token_hash: data.tokenHash,
    type: 'magiclink',
  })

  if (error) {
    throw new Error(error.message)
  }
}
