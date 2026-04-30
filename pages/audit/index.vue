<template>
  <div class="space-y-6">
    <h1 class="page-title">Journal d'audit</h1>

    <div class="card overflow-hidden">
      <div v-if="pending"><LoadingSpinner /></div>
      <div v-else-if="!data?.logs?.length">
        <EmptyState icon="📋" title="Aucun log" description="Le journal est vide" />
      </div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Date</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Action</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Acteur</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Entité</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Cible</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="log in data.logs" :key="log.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{{ formatDate(log.createdAt) }}</td>
                <td class="px-4 py-3">
                  <span :class="actionBadge(log.action)">{{ actionIcon(log.action) }} {{ log.action }}</span>
                </td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {{ log.actor ? `${log.actor.prenom} ${log.actor.nom}` : 'Système' }}
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                  {{ log.entity }}{{ log.entityId ? ` #${log.entityId}` : '' }}
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                  {{ log.target ? `${log.target.prenom} ${log.target.nom}` : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          <p class="text-sm text-gray-500">{{ data.total }} entrée(s)</p>
          <div class="flex items-center gap-2">
            <button :disabled="page <= 1" @click="page--" class="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">‹ Préc.</button>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ page }}/{{ data.totalPages }}</span>
            <button :disabled="page >= data.totalPages" @click="page++" class="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Suiv. ›</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const page = ref(1)
const { data, pending } = useFetch<{ logs: any[]; total: number; page: number; totalPages: number }>('/api/audit', {
  query: computed(() => ({ page: page.value, perPage: 25 })),
})

const formatDate = (d: string) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const actionIcon = (a: string) => ({ create: '➕', update: '✏️', delete: '🗑️', login: '🔑', logout: '🚪', invite: '📧', password_reset: '🔒' }[a] ?? '●')
const actionBadge = (a: string) => ({
  create: 'badge badge-green', update: 'badge badge-blue', delete: 'badge badge-red',
  login: 'badge badge-purple', logout: 'badge', invite: 'badge badge-yellow', password_reset: 'badge badge-yellow',
}[a] ?? 'badge')
</script>
