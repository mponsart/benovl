<template>
  <header class="flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
    <div class="flex items-center gap-3">
      <!-- Mobile menu toggle -->
      <button @click="$emit('toggleMobile')" class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <!-- Page title via breadcrumb -->
      <h1 class="text-base font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <!-- Dark mode toggle -->
      <button @click="toggleDark" class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" :title="isDark ? 'Mode clair' : 'Mode sombre'">
        <svg v-if="isDark" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      </button>

      <!-- User menu -->
      <div class="relative" ref="userMenuRef">
        <button @click="showUserMenu = !showUserMenu" class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {{ userInitials }}
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-sm font-medium text-gray-800 dark:text-gray-100 leading-tight">{{ user?.prenom }} {{ user?.nom }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ user?.role }}</p>
          </div>
          <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>

        <Transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="showUserMenu" class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
            <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user?.email }}</p>
              <span :class="roleBadgeClass">{{ user?.role }}</span>
            </div>
            <button @click="handleLogout" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Déconnexion
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const { isDark, toggle: toggleDark } = useDarkMode()
const route = useRoute()

defineEmits(['toggleMobile'])

const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement>()

onClickOutside(userMenuRef, () => { showUserMenu.value = false })

const userInitials = computed(() => {
  if (!user.value) return '?'
  return `${user.value.prenom?.[0] ?? ''}${user.value.nom?.[0] ?? ''}`.toUpperCase()
})

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/rh': 'Gestion RH',
  '/planning': 'Planning',
  '/planning/creneaux': 'Créneaux',
  '/communication': 'Communication',
  '/documents': 'Documents',
  '/audit': 'Journal d\'audit',
}

const pageTitle = computed(() => {
  const path = route.path
  for (const [key, val] of Object.entries(pageTitles)) {
    if (path === key || path.startsWith(key + '/')) return val
  }
  return 'BénoVL'
})

const roleBadgeClass = computed(() => {
  const classes = { admin: 'badge-purple', responsable: 'badge-blue', benevole: 'badge-green' }
  return `badge ${classes[user.value?.role as keyof typeof classes] ?? 'badge-blue'} mt-1`
})

const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
}
</script>
