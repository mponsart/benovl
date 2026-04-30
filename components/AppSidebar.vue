<template>
  <aside :class="['fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-sm', isOpen ? 'w-64' : 'w-16', 'hidden md:flex']">
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-700 min-h-[65px]">
      <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <span class="text-white font-bold text-sm">B</span>
      </div>
      <span v-if="isOpen" class="font-bold text-gray-900 dark:text-white text-lg truncate">BénoVL</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
          $route.path.startsWith(item.path) && item.path !== '/dashboard' || $route.path === item.path
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white']"
        :title="!isOpen ? item.label : undefined"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span v-if="isOpen" class="truncate">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Toggle button -->
    <div class="p-3 border-t border-gray-200 dark:border-gray-700">
      <button @click="$emit('toggle')" class="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <svg v-if="isOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
      </button>
    </div>
  </aside>

  <!-- Mobile overlay -->
  <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/50 md:hidden" @click="$emit('closeMobile')" />
  <aside :class="['fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl md:hidden transition-transform duration-300', mobileOpen ? 'translate-x-0' : '-translate-x-full']">
    <div class="flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-700">
      <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <span class="text-white font-bold text-sm">B</span>
      </div>
      <span class="font-bold text-gray-900 dark:text-white text-lg">BénoVL</span>
    </div>
    <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        @click="$emit('closeMobile')"
        :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
          $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/dashboard')
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white']"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const { user, isAdmin, isAdminOrResponsable } = useAuth()

const props = defineProps<{
  isOpen: boolean
  mobileOpen: boolean
}>()

defineEmits(['toggle', 'closeMobile'])

const IconHome = { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>' }
const IconUsers = { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>' }
const IconCalendar = { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>' }
const IconBell = { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>' }
const IconDoc = { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>' }
const IconLog = { template: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>' }

const allNavItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: IconHome, roles: ['admin', 'responsable', 'benevole'] },
  { path: '/rh', label: 'Gestion RH', icon: IconUsers, roles: ['admin', 'responsable'] },
  { path: '/planning', label: 'Planning', icon: IconCalendar, roles: ['admin', 'responsable', 'benevole'] },
  { path: '/communication', label: 'Communication', icon: IconBell, roles: ['admin', 'responsable', 'benevole'] },
  { path: '/documents', label: 'Documents', icon: IconDoc, roles: ['admin', 'responsable', 'benevole'] },
  { path: '/audit', label: 'Audit', icon: IconLog, roles: ['admin'] },
]

const navItems = computed(() => allNavItems.filter(item => !user.value || item.roles.includes(user.value.role)))
</script>
