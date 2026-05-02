<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="page-title">⏱️ Pointage</h1>
    </div>

    <!-- Clock status -->
    <div class="card p-6">
      <div class="flex flex-col sm:flex-row items-center gap-6">
        <div class="text-center flex-1">
          <div class="text-4xl font-bold text-gray-900 dark:text-white mb-1">{{ currentTime }}</div>
          <div class="text-sm text-gray-500">{{ currentDate }}</div>
        </div>
        <div class="flex-1 text-center">
          <div v-if="openEntry" class="space-y-2">
            <div class="text-green-600 dark:text-green-400 font-semibold text-lg">✅ Pointé depuis {{ formatTime(openEntry.clockIn) }}</div>
            <div class="text-sm text-gray-500">Durée: {{ elapsed }}</div>
            <button @click="clockOut" :disabled="clocking" class="btn-danger">
              {{ clocking ? 'En cours...' : '⏹ Pointer la sortie' }}
            </button>
          </div>
          <div v-else class="space-y-2">
            <div class="text-gray-500 text-lg">⏸ Non pointé</div>
            <button @click="clockIn" :disabled="clocking" class="btn-primary">
              {{ clocking ? 'En cours...' : '▶ Pointer l\'entrée' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent entries -->
    <div class="card overflow-hidden">
      <div class="p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 class="section-title">Historique récent</h2>
      </div>
      <div v-if="pending" class="p-8"><LoadingSpinner /></div>
      <div v-else-if="!entries?.length">
        <EmptyState icon="⏱️" title="Aucun pointage" description="Votre historique de pointage apparaîtra ici" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Date</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Entrée</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Sortie</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Durée</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Statut</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="e in entries" :key="e.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ formatDate(e.clockIn) }}</td>
              <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ formatTime(e.clockIn) }}</td>
              <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ e.clockOut ? formatTime(e.clockOut) : '—' }}</td>
              <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ e.clockOut ? duration(e.clockIn, e.clockOut) : '—' }}</td>
              <td class="px-4 py-3">
                <span :class="statusBadge(e.status)">{{ statusLabel(e.status) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeEntry } from '~/types'

definePageMeta({ middleware: 'auth' })

const toast = useToast()

const { data: entries, pending, refresh } = useFetch<TimeEntry[]>('/api/pointage')
const clocking = ref(false)

const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(timer))

const currentTime = computed(() => now.value.toLocaleTimeString('fr-FR'))
const currentDate = computed(() => now.value.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

const openEntry = computed(() => entries.value?.find(e => !e.clockOut) ?? null)

const elapsed = computed(() => {
  if (!openEntry.value) return ''
  const ms = now.value.getTime() - new Date(openEntry.value.clockIn).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h${String(m).padStart(2, '0')}`
})

const statusBadge = (s: string) => ({ pending: 'badge badge-gray', validated: 'badge badge-green', anomaly: 'badge badge-red' }[s] ?? 'badge')
const statusLabel = (s: string) => ({ pending: 'En attente', validated: 'Validé', anomaly: 'Anomalie' }[s] ?? s)

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')
const formatTime = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
const duration = (start: string, end: string) => {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h${String(m).padStart(2, '0')}`
}

const clockIn = async () => {
  clocking.value = true
  try {
    await $fetch('/api/pointage/clock-in', { method: 'POST' })
    toast.success('Pointage d\'entrée enregistré')
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    clocking.value = false
  }
}

const clockOut = async () => {
  clocking.value = true
  try {
    await $fetch('/api/pointage/clock-out', { method: 'POST' })
    toast.success('Pointage de sortie enregistré')
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    clocking.value = false
  }
}
</script>
