<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <h1 class="page-title">Communication</h1>
      <button v-if="isAdmin" @click="openCreate" class="btn-primary text-sm">➕ Nouvelle annonce</button>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3">
      <button @click="filter = ''" :class="['btn text-sm px-3 py-1.5', !filter ? 'btn-primary' : 'btn-secondary']">Toutes</button>
      <button @click="filter = 'global'" :class="['btn text-sm px-3 py-1.5', filter === 'global' ? 'btn-primary' : 'btn-secondary']">Globales</button>
      <button @click="filter = 'pole'" :class="['btn text-sm px-3 py-1.5', filter === 'pole' ? 'btn-primary' : 'btn-secondary']">Par pôle</button>
    </div>

    <!-- Announcements -->
    <div v-if="pending"><LoadingSpinner /></div>
    <div v-else-if="!filteredAnnouncements?.length">
      <EmptyState icon="📢" title="Aucune annonce" description="Pas d'annonce pour le moment" />
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="a in filteredAnnouncements"
        :key="a.id"
        class="card p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 flex-1">
            <span v-if="a.isPinned" class="text-yellow-500 text-xl flex-shrink-0 mt-0.5">📌</span>
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ a.title }}</h3>
                <span :class="a.type === 'global' ? 'badge badge-blue' : 'badge badge-purple'">
                  {{ a.type === 'global' ? '🌍 Global' : `📍 ${a.pole?.name ?? 'Pôle'}` }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{{ a.content }}</p>
              <p class="text-xs text-gray-400 mt-2">{{ formatDate(a.createdAt) }}</p>
            </div>
          </div>
          <div v-if="isAdmin" class="flex items-center gap-1 flex-shrink-0">
            <button @click="openEdit(a)" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button @click="deleteAnnouncement(a)" class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <AppModal :show="showModal" :title="editing ? 'Modifier l\'annonce' : 'Nouvelle annonce'" size="lg" @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="label">Titre *</label>
          <input v-model="form.title" type="text" class="input" required />
        </div>
        <div>
          <label class="label">Contenu *</label>
          <textarea v-model="form.content" class="input" rows="5" required />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Type *</label>
            <select v-model="form.type" class="input">
              <option value="global">Global</option>
              <option value="pole">Par pôle</option>
            </select>
          </div>
          <div v-if="form.type === 'pole'">
            <label class="label">Pôle</label>
            <select v-model="form.poleId" class="input">
              <option :value="null">Sélectionner...</option>
              <option v-for="p in poles" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.isPinned" type="checkbox" id="pinned" class="rounded" />
          <label for="pinned" class="text-sm text-gray-700 dark:text-gray-300">Épingler cette annonce</label>
        </div>
        <div v-if="formError" class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">{{ formError }}</div>
      </form>
      <template #footer>
        <button @click="closeModal" class="btn-secondary">Annuler</button>
        <button @click="handleSubmit" :disabled="saving" class="btn-primary">
          {{ saving ? 'Enregistrement...' : (editing ? 'Modifier' : 'Publier') }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Announcement, Pole } from '~/types'

definePageMeta({ middleware: 'auth' })

const { isAdmin } = useAuth()
const toast = useToast()

const filter = ref('')
const showModal = ref(false)
const editing = ref<Announcement | null>(null)
const saving = ref(false)
const formError = ref('')

const { data: announcements, pending, refresh } = useFetch<Announcement[]>('/api/announcements')
const { data: poles } = useFetch<Pole[]>('/api/poles')

const form = reactive({ title: '', content: '', type: 'global' as 'global' | 'pole', poleId: null as number | null, isPinned: false })

const filteredAnnouncements = computed(() => {
  if (!announcements.value) return []
  if (!filter.value) return announcements.value
  return announcements.value.filter(a => a.type === filter.value)
})

const resetForm = () => Object.assign(form, { title: '', content: '', type: 'global', poleId: null, isPinned: false })
const openCreate = () => { resetForm(); editing.value = null; showModal.value = true }
const closeModal = () => { showModal.value = false; editing.value = null; formError.value = '' }
const openEdit = (a: Announcement) => {
  editing.value = a
  Object.assign(form, { title: a.title, content: a.content, type: a.type, poleId: a.poleId ?? null, isPinned: a.isPinned })
  showModal.value = true
}

const handleSubmit = async () => {
  formError.value = ''
  saving.value = true
  try {
    if (editing.value) {
      await $fetch(`/api/announcements/${editing.value.id}`, { method: 'PUT', body: form })
      toast.success('Annonce modifiée')
    } else {
      await $fetch('/api/announcements', { method: 'POST', body: form })
      toast.success('Annonce publiée')
    }
    closeModal()
    refresh()
  } catch (e: any) {
    formError.value = e?.data?.message ?? 'Erreur'
  } finally {
    saving.value = false
  }
}

const deleteAnnouncement = async (a: Announcement) => {
  if (!confirm(`Supprimer "${a.title}" ?`)) return
  try {
    await $fetch(`/api/announcements/${a.id}`, { method: 'DELETE' })
    toast.success('Annonce supprimée')
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>
