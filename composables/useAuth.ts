import type { AuthUser } from '~/types'

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth.user', () => null)
  const loading = useState<boolean>('auth.loading', () => false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isResponsable = computed(() => user.value?.role === 'responsable')
  const isAdminOrResponsable = computed(() => ['admin', 'responsable'].includes(user.value?.role ?? ''))

  const fetchUser = async () => {
    try {
      loading.value = true
      const data = await $fetch<AuthUser>('/api/auth/me')
      user.value = data
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    const data = await $fetch<{ user: AuthUser; accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = data.user
    return data
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      await navigateTo('/login')
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isResponsable,
    isAdminOrResponsable,
    fetchUser,
    login,
    logout,
  }
}
