<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="page-title">Planning</h1>
      <div class="flex items-center gap-2">
        <NuxtLink v-if="isAdminOrResponsable" to="/planning/creneaux" class="btn-primary text-sm">
          ➕ Gérer les créneaux
        </NuxtLink>
      </div>
    </div>

    <!-- Calendar navigation -->
    <div class="card p-4">
      <div class="flex items-center justify-between mb-4">
        <button @click="prevMonth" class="btn-secondary text-sm px-3 py-1.5">‹ Préc.</button>
        <h2 class="section-title capitalize">{{ currentMonthLabel }}</h2>
        <button @click="nextMonth" class="btn-secondary text-sm px-3 py-1.5">Suiv. ›</button>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        <div v-for="day in weekDays" :key="day" class="text-center text-xs font-medium text-gray-400 py-2">{{ day }}</div>
        <div v-for="cell in calendarCells" :key="cell.key"
          :class="['min-h-[80px] p-1 rounded-lg border transition-colors', cell.isCurrentMonth ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-900 border-transparent', cell.isToday ? 'border-indigo-300 dark:border-indigo-600' : '']"
        >
          <div :class="['text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full', cell.isToday ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400']">
            {{ cell.day }}
          </div>
          <div class="space-y-0.5">
            <div
              v-for="slot in cell.slots"
              :key="slot.id"
              @click="openSlot(slot)"
              :class="['text-xs px-1 py-0.5 rounded cursor-pointer truncate transition-colors', slotColor(slot)]"
              :title="slot.title"
            >
              {{ slot.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming slots list -->
    <div class="card">
      <div class="p-5 border-b border-gray-100 dark:border-gray-700">
        <h2 class="section-title">📋 Prochains créneaux</h2>
      </div>
      <div v-if="upcomingSlots?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
        <div v-for="slot in upcomingSlots" :key="slot.id" class="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div class="flex items-center gap-4">
            <div class="text-center bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-2 min-w-[50px]">
              <p class="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase">{{ formatMonth(slot.startAt) }}</p>
              <p class="text-xl font-bold text-indigo-700 dark:text-indigo-300 leading-none">{{ formatDay(slot.startAt) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ slot.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatTime(slot.startAt) }} - {{ formatTime(slot.endAt) }}
                <span v-if="slot.location"> · 📍 {{ slot.location }}</span>
                <span v-if="slot.pole"> · {{ slot.pole.name }}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-500">{{ slot._count?.registrations ?? 0 }}/{{ slot.maxCapacity }}</span>
            <button
              v-if="!isRegistered(slot.id) && (slot.openForSelfRegistration || isAdminOrResponsable)"
              @click="register(slot)"
              :disabled="(slot._count?.registrations ?? 0) >= slot.maxCapacity"
              class="btn-primary text-xs px-3 py-1.5"
            >
              S'inscrire
            </button>
            <span v-else-if="isRegistered(slot.id)" :class="registrationStatus(slot.id)">
              {{ getRegistrationStatus(slot.id) }}
            </span>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="📅" title="Aucun créneau à venir" description="Pas de créneaux planifiés pour les prochains jours" />
    </div>

    <!-- Slot Detail Modal -->
    <AppModal :show="!!selectedSlot" :title="selectedSlot?.title ?? ''" size="lg" @close="selectedSlot = null">
      <div v-if="selectedSlot" class="space-y-4">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Début</p>
            <p class="font-medium">{{ formatDateTime(selectedSlot.startAt) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Fin</p>
            <p class="font-medium">{{ formatDateTime(selectedSlot.endAt) }}</p>
          </div>
          <div v-if="selectedSlot.location">
            <p class="text-xs text-gray-400 uppercase tracking-wide">Lieu</p>
            <p class="font-medium">📍 {{ selectedSlot.location }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Capacité</p>
            <p class="font-medium">{{ selectedSlot._count?.registrations ?? 0 }}/{{ selectedSlot.maxCapacity }}</p>
          </div>
        </div>
        <div v-if="selectedSlot.description">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
          <p class="text-sm text-gray-700 dark:text-gray-300">{{ selectedSlot.description }}</p>
        </div>
        <div v-if="selectedSlot.registrations?.length">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-2">Inscrits ({{ selectedSlot.registrations.length }})</p>
          <div class="space-y-1">
            <div v-for="reg in selectedSlot.registrations" :key="reg.id" class="flex items-center justify-between text-sm">
              <span>{{ reg.user?.prenom }} {{ reg.user?.nom }}</span>
              <span :class="{ inscrit: 'badge badge-blue', confirme: 'badge badge-green', absent: 'badge badge-red' }[reg.status] ?? 'badge'">{{ reg.status }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button v-if="!isRegistered(selectedSlot?.id ?? 0) && (selectedSlot?.openForSelfRegistration || isAdminOrResponsable)" @click="register(selectedSlot!)" class="btn-primary">
          S'inscrire
        </button>
        <button @click="selectedSlot = null" class="btn-secondary">Fermer</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { PlanningSlot, PlanningRegistration } from '~/types'

definePageMeta({ middleware: 'auth' })

const { isAdminOrResponsable, user } = useAuth()
const toast = useToast()

const currentDate = ref(new Date())
const selectedSlot = ref<PlanningSlot | null>(null)
const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const firstDay = computed(() => new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1))
const lastDay = computed(() => new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0))

const { data: slots, refresh: refreshSlots } = useFetch<PlanningSlot[]>('/api/planning/slots', {
  query: computed(() => ({ from: firstDay.value.toISOString(), to: lastDay.value.toISOString() })),
})
const { data: myRegistrations, refresh: refreshRegs } = useFetch<PlanningRegistration[]>('/api/planning/registrations')

const currentMonthLabel = computed(() => currentDate.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))

const prevMonth = () => { const d = new Date(currentDate.value); d.setMonth(d.getMonth() - 1); currentDate.value = d }
const nextMonth = () => { const d = new Date(currentDate.value); d.setMonth(d.getMonth() + 1); currentDate.value = d }

const calendarCells = computed(() => {
  const cells = []
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const first = new Date(year, month, 1)
  let startDow = first.getDay() - 1
  if (startDow < 0) startDow = 6

  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, 1 - (startDow - i))
    cells.push({ key: `prev-${i}`, day: d.getDate(), date: d, isCurrentMonth: false, isToday: false, slots: [] })
  }

  const daysInMonth = lastDay.value.getDate()
  const today = new Date()
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const daySlots = (slots.value ?? []).filter(s => {
      const sd = new Date(s.startAt)
      return sd.getDate() === d && sd.getMonth() === month && sd.getFullYear() === year
    })
    cells.push({
      key: `${year}-${month}-${d}`,
      day: d,
      date,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      slots: daySlots,
    })
  }

  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    cells.push({ key: `next-${i}`, day: d.getDate(), date: d, isCurrentMonth: false, isToday: false, slots: [] })
  }
  return cells
})

const upcomingSlots = computed(() => {
  const now = new Date()
  return (slots.value ?? []).filter(s => new Date(s.startAt) >= now).slice(0, 10)
})

const isRegistered = (slotId: number) => (myRegistrations.value ?? []).some(r => r.slotId === slotId)
const getRegistrationStatus = (slotId: number) => (myRegistrations.value ?? []).find(r => r.slotId === slotId)?.status ?? ''
const registrationStatus = (slotId: number) => {
  const s = getRegistrationStatus(slotId)
  return { inscrit: 'badge badge-blue', confirme: 'badge badge-green', absent: 'badge badge-red' }[s] ?? 'badge'
}

const openSlot = (slot: PlanningSlot) => { selectedSlot.value = slot }
const slotColor = (slot: PlanningSlot) => {
  if (isRegistered(slot.id)) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
}

const register = async (slot: PlanningSlot | null) => {
  if (!slot) return
  try {
    await $fetch('/api/planning/registrations', { method: 'POST', body: { slotId: slot.id } })
    toast.success('Inscription réussie')
    refreshSlots()
    refreshRegs()
    selectedSlot.value = null
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const formatMonth = (d: string) => new Date(d).toLocaleDateString('fr-FR', { month: 'short' })
const formatDay = (d: string) => new Date(d).getDate()
const formatTime = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
const formatDateTime = (d: string) => new Date(d).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
</script>
