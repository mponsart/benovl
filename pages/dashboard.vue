<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="page-title">Tableau de bord</h1>
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ greeting }}, {{ user?.prenom }} 👋</span>
    </div>

    <!-- Stats Grid -->
    <div v-if="pending" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="card p-5 animate-pulse">
        <div class="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
        <div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
        <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>

    <div v-else-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="👥" label="Bénévoles actifs" :value="stats.activeUsers" icon-bg="bg-indigo-100 dark:bg-indigo-900/30" />
      <StatCard icon="📅" label="Créneaux à venir" :value="stats.upcomingSlots" icon-bg="bg-blue-100 dark:bg-blue-900/30" />
      <StatCard icon="✅" label="Confirmés" :value="stats.confirmedRegistrations" icon-bg="bg-green-100 dark:bg-green-900/30" />
      <StatCard icon="❌" label="Absences" :value="stats.absentRegistrations" icon-bg="bg-red-100 dark:bg-red-900/30" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Announcements -->
      <div class="card">
        <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 class="section-title">📢 Annonces récentes</h2>
          <NuxtLink to="/communication" class="text-sm text-indigo-600 hover:underline dark:text-indigo-400">Voir tout</NuxtLink>
        </div>
        <div v-if="stats?.announcements?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
          <div v-for="a in stats.announcements" :key="a.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <div class="flex items-start gap-3">
              <span v-if="a.isPinned" class="text-yellow-500 text-sm mt-0.5">📌</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ a.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{{ a.content }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ formatDate(a.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="📢" title="Aucune annonce" description="Pas d'annonce pour le moment" />
      </div>

      <!-- Recent Activity -->
      <div class="card" v-if="isAdminOrResponsable">
        <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 class="section-title">⚡ Activité récente</h2>
          <NuxtLink v-if="isAdmin" to="/audit" class="text-sm text-indigo-600 hover:underline dark:text-indigo-400">Voir tout</NuxtLink>
        </div>
        <div v-if="stats?.recentAuditLogs?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
          <div v-for="log in stats.recentAuditLogs.slice(0, 6)" :key="log.id" class="p-4">
            <div class="flex items-center gap-3">
              <span class="text-lg">{{ actionIcon(log.action) }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-800 dark:text-gray-200">
                  <span class="font-medium">{{ log.actor ? `${log.actor.prenom} ${log.actor.nom}` : 'Système' }}</span>
                  {{ actionLabel(log.action) }}
                  <span class="font-medium">{{ log.entity }}</span>
                </p>
                <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(log.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="⚡" title="Aucune activité" description="Aucune action récente" />
      </div>

      <!-- Upcoming slots for benevoles -->
      <div v-if="!isAdminOrResponsable" class="card">
        <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 class="section-title">📅 Mes prochains créneaux</h2>
          <NuxtLink to="/planning" class="text-sm text-indigo-600 hover:underline dark:text-indigo-400">Voir tout</NuxtLink>
        </div>
        <div v-if="myRegistrations?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
          <div v-for="reg in myRegistrations.slice(0, 5)" :key="reg.id" class="p-4">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ reg.slot?.title }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ formatDateTime(reg.slot?.startAt) }}</p>
              </div>
              <span :class="statusBadge(reg.status)">{{ reg.status }}</span>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="📅" title="Aucun créneau" description="Vous n'êtes inscrit à aucun créneau" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats, PlanningRegistration } from '~/types'

definePageMeta({ middleware: 'auth' })

const { user, isAdmin, isAdminOrResponsable } = useAuth()
const { init: initDark } = useDarkMode()

onMounted(() => initDark())

const { data: stats, pending } = useFetch<DashboardStats>('/api/dashboard')
const { data: myRegistrations } = useLazyFetch<PlanningRegistration[]>('/api/planning/registrations', {
  query: { userId: user.value?.id },
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
})

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const formatDateTime = (d?: string) => d ? new Date(d).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

const actionIcon = (action: string) => ({ create: '➕', update: '✏️', delete: '🗑️', login: '🔑', logout: '🚪', invite: '📧', password_reset: '🔒' }[action] ?? '●')
const actionLabel = (action: string) => ({ create: ' a créé ', update: ' a modifié ', delete: ' a supprimé ', login: ' s\'est connecté(e) — ', logout: ' s\'est déconnecté(e) — ', invite: ' a invité — ', password_reset: ' a réinitialisé le mot de passe — ' }[action] ?? ' — ')

const statusBadge = (status: string) => ({ inscrit: 'badge badge-blue', confirme: 'badge badge-green', absent: 'badge badge-red' }[status] ?? 'badge')
</script>
