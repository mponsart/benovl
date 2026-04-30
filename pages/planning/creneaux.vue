<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <NuxtLink to="/planning" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </NuxtLink>
        <h1 class="page-title">Gestion des créneaux</h1>
      </div>
      <button @click="openCreateModal" class="btn-primary text-sm">➕ Nouveau créneau</button>
    </div>

    <!-- Slots list -->
    <div class="card overflow-hidden">
      <div v-if="pending"><LoadingSpinner /></div>
      <div v-else-if="!slots?.length">
        <EmptyState icon="📅" title="Aucun créneau" description="Créez votre premier créneau de planning" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Titre</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Date</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Lieu</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Places</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Pôle</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="slot in slots" :key="slot.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td class="px-4 py-3">
                <p class="font-medium text-gray-900 dark:text-white">{{ slot.title }}</p>
                <p class="text-xs text-gray-500 md:hidden">{{ formatDate(slot.startAt) }}</p>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                <p>{{ formatDate(slot.startAt) }}</p>
                <p class="text-xs text-gray-400">{{ formatTime(slot.startAt) }} - {{ formatTime(slot.endAt) }}</p>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell">{{ slot.location ?? '—' }}</td>
              <td class="px-4 py-3">
                <span :class="['text-xs font-medium', (slot._count?.registrations ?? 0) >= slot.maxCapacity ? 'text-red-600' : 'text-gray-600 dark:text-gray-400']">
                  {{ slot._count?.registrations ?? 0 }}/{{ slot.maxCapacity }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{{ slot.pole?.name ?? '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button @click="openEditModal(slot)" class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors" title="Modifier">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button @click="deleteSlot(slot)" class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 transition-colors" title="Supprimer">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <AppModal :show="showModal" :title="editingSlot ? 'Modifier le créneau' : 'Nouveau créneau'" size="lg" @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="label">Titre *</label>
          <input v-model="form.title" type="text" class="input" required />
        </div>
        <div>
          <label class="label">Description</label>
          <textarea v-model="form.description" class="input" rows="2" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Début *</label>
            <input v-model="form.startAt" type="datetime-local" class="input" required />
          </div>
          <div>
            <label class="label">Fin *</label>
            <input v-model="form.endAt" type="datetime-local" class="input" required />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Lieu</label>
            <input v-model="form.location" type="text" class="input" />
          </div>
          <div>
            <label class="label">Capacité max *</label>
            <input v-model.number="form.maxCapacity" type="number" class="input" min="1" required />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Pôle</label>
            <select v-model="form.poleId" class="input">
              <option :value="null">Aucun pôle</option>
              <option v-for="p in poles" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2 pt-6">
            <input v-model="form.openForSelfRegistration" type="checkbox" id="selfReg" class="rounded" />
            <label for="selfReg" class="text-sm text-gray-700 dark:text-gray-300">Auto-inscription</label>
          </div>
        </div>
        <div v-if="formError" class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">{{ formError }}</div>
      </form>
      <template #footer>
        <button @click="closeModal" class="btn-secondary">Annuler</button>
        <button @click="handleSubmit" :disabled="saving" class="btn-primary">
          {{ saving ? 'Enregistrement...' : (editingSlot ? 'Modifier' : 'Créer') }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { PlanningSlot, Pole } from '~/types'

definePageMeta({ middleware: ['auth', 'admin-or-responsable'] })

const toast = useToast()
const { data: slots, pending, refresh } = useFetch<PlanningSlot[]>('/api/planning/slots')
const { data: poles } = useFetch<Pole[]>('/api/poles')

const showModal = ref(false)
const editingSlot = ref<PlanningSlot | null>(null)
const saving = ref(false)
const formError = ref('')

const toLocalDatetime = (d: string) => new Date(d).toISOString().slice(0, 16)

const form = reactive({
  title: '', description: '', startAt: '', endAt: '',
  location: '', maxCapacity: 10, poleId: null as number | null, openForSelfRegistration: false,
})

const resetForm = () => {
  Object.assign(form, { title: '', description: '', startAt: '', endAt: '', location: '', maxCapacity: 10, poleId: null, openForSelfRegistration: false })
  formError.value = ''
}

const openCreateModal = () => { resetForm(); editingSlot.value = null; showModal.value = true }
const closeModal = () => { showModal.value = false; editingSlot.value = null; resetForm() }

const openEditModal = (slot: PlanningSlot) => {
  editingSlot.value = slot
  Object.assign(form, { title: slot.title, description: slot.description ?? '', startAt: toLocalDatetime(slot.startAt), endAt: toLocalDatetime(slot.endAt), location: slot.location ?? '', maxCapacity: slot.maxCapacity, poleId: slot.poleId ?? null, openForSelfRegistration: slot.openForSelfRegistration })
  showModal.value = true
}

const handleSubmit = async () => {
  formError.value = ''
  saving.value = true
  try {
    const body = {
      ...form,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
    }
    if (editingSlot.value) {
      await $fetch(`/api/planning/slots/${editingSlot.value.id}`, { method: 'PUT', body })
      toast.success('Créneau modifié')
    } else {
      await $fetch('/api/planning/slots', { method: 'POST', body })
      toast.success('Créneau créé')
    }
    closeModal()
    refresh()
  } catch (e: any) {
    formError.value = e?.data?.message ?? 'Erreur'
  } finally {
    saving.value = false
  }
}

const deleteSlot = async (slot: PlanningSlot) => {
  if (!confirm(`Supprimer "${slot.title}" ?`)) return
  try {
    await $fetch(`/api/planning/slots/${slot.id}`, { method: 'DELETE' })
    toast.success('Créneau supprimé')
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
const formatTime = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
</script>
