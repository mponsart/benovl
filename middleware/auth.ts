export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login' || to.path === '/invite' || to.path === '/reset-password') return

  const { user, fetchUser } = useAuth()

  if (!user.value) {
    await fetchUser()
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
