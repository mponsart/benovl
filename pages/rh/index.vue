<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="page-title">Gestion RH</h1>
      <div class="flex items-center gap-2">
        <button @click="exportCSV" class="btn-secondary text-sm">
          📥 Exporter CSV
        </button>
        <NuxtLink v-if="isAdmin" to="/rh/nouveau" class="btn-primary text-sm">
          ➕ Nouveau bénévole
        </NuxtLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input v-model="search" type="text" class="input" placeholder="🔍 Rechercher..." />
        <select v-model="filterRole" class="input">
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="responsable">Responsable</option>
          <option value="benevole">Bénévole</option>
        </select>
        <select v-model="filterStatus" class="input">
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="suspendu">Suspendu</option>
        </select>
        <select v-model="filterPole" class="input">
          <option value="">Tous les pôles</option>
          <option v-for="p in poles" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="pending" class="p-8">
        <LoadingSpinner />
      </div>
      <div v-else-if="!filteredUsers?.length">
        <EmptyState icon="👤" title="Aucun utilisateur trouvé" description="Modifiez vos filtres ou créez un nouvel utilisateur" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Nom</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Email</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Rôle</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Pôle</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Statut</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs flex-shrink-0">
                    {{ u.prenom[0] }}{{ u.nom[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ u.prenom }} {{ u.nom }}</p>
                    <p class="text-xs text-gray-500 md:hidden">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{{ u.email }}</td>
              <td class="px-4 py-3"><UserBadge :role="u.role" /></td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{{ u.pole?.name ?? '—' }}</td>
              <td class="px-4 py-3"><UserBadge :status="u.status" /></td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink :to="`/rh/${u.id}`" class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Voir le profil">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </NuxtLink>
                  <button v-if="isAdmin && u.status === 'actif'" @click="deactivateUser(u)" class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 transition-colors" title="Désactiver">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          {{ filteredUsers.length }} utilisateur(s) affiché(s)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, Pole } from '~/types'

definePageMeta({ middleware: ['auth', 'admin-or-responsable'] })

const { isAdmin } = useAuth()
const toast = useToast()

const search = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const filterPole = ref<number | ''>('')

const { data: users, pending, refresh } = useFetch<User[]>('/api/users')
const { data: poles } = useFetch<Pole[]>('/api/poles')

const filteredUsers = computed(() => {
  if (!users.value) return []
  return users.value.filter(u => {
    const s = search.value.toLowerCase()
    const matchSearch = !s || `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(s)
    const matchRole = !filterRole.value || u.role === filterRole.value
    const matchStatus = !filterStatus.value || u.status === filterStatus.value
    const matchPole = !filterPole.value || u.poleId === Number(filterPole.value)
    return matchSearch && matchRole && matchStatus && matchPole
  })
})

const deactivateUser = async (u: User) => {
  if (!confirm(`Désactiver ${u.prenom} ${u.nom} ?`)) return
  try {
    await $fetch(`/api/users/${u.id}/deactivate`, { method: 'POST' })
    toast.success('Compte désactivé')
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const exportCSV = async () => {
  try {
    const csv = await $fetch('/api/users/export', { responseType: 'text' })
    const blob = new Blob([csv as string], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'benevoles.csv'; a.click()
    URL.revokeObjectURL(url)
  } catch (e: any) {
    toast.error('Erreur lors de l\'export')
  }
}
</script>
