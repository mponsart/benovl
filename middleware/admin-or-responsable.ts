export default defineNuxtRouteMiddleware(() => {
  const { isAdminOrResponsable } = useAuth()
  if (!isAdminOrResponsable.value) {
    return navigateTo('/dashboard')
  }
})
