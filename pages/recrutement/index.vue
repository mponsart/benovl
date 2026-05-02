<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="page-title">💼 Recrutement</h1>
      <button v-if="isAdminOrResponsable" @click="showCreateModal = true" class="btn-primary text-sm">➕ Nouvelle offre</button>
    </div>

    <div v-if="pending" class="p-8"><LoadingSpinner /></div>
    <div v-else-if="!postings?.length">
      <EmptyState icon="💼" title="Aucune offre" description="Créez votre première offre d'emploi" />
    </div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Postings list -->
      <div class="lg:col-span-1 space-y-3">
        <div
          v-for="p in postings"
          :key="p.id"
          @click="selectPosting(p)"
          class="card p-4 cursor-pointer transition-all hover:shadow-md"
          :class="selected?.id === p.id ? 'ring-2 ring-indigo-500' : ''"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 dark:text-white truncate">{{ p.title }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ p.pole?.name ?? 'Tous pôles' }}</p>
            </div>
            <span :class="statusBadge(p.status)" class="text-xs flex-shrink-0">{{ statusLabel(p.status) }}</span>
          </div>
          <div class="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{{ p._count?.applications ?? 0 }} candidature(s)</span>
            <span>{{ p.slots }} poste(s)</span>
          </div>
        </div>
      </div>

      <!-- Selected posting detail -->
      <div class="lg:col-span-2">
        <div v-if="!selected" class="card p-8 text-center text-gray-500">
          <p>Sélectionnez une offre pour voir les candidatures</p>
        </div>
        <div v-else class="space-y-4">
          <div class="card p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="section-title">{{ selected.title }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{{ selected.description }}</p>
              </div>
              <div class="flex gap-2 flex-shrink-0" v-if="isAdminOrResponsable">
                <select @change="updateStatus(selected, ($event.target as HTMLSelectElement).value)" class="input text-sm py-1">
                  <option value="draft" :selected="selected.status === 'draft'">Brouillon</option>
                  <option value="published" :selected="selected.status === 'published'">Publiée</option>
                  <option value="closed" :selected="selected.status === 'closed'">Fermée</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Pipeline summary -->
          <div class="card p-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pipeline</h3>
            <div class="grid grid-cols-5 gap-2 text-center text-xs">
              <div v-for="s in appStatuses" :key="s.value" class="space-y-1">
                <div class="font-bold text-lg text-gray-900 dark:text-white">{{ countByStatus(s.value) }}</div>
                <div :class="s.badge">{{ s.label }}</div>
              </div>
            </div>
          </div>

          <!-- Applications list -->
          <div class="card overflow-hidden">
            <div class="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 class="section-title">Candidatures</h3>
            </div>
            <div v-if="!detailPosting?.applications?.length">
              <EmptyState icon="📋" title="Aucune candidature" description="" />
            </div>
            <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
              <div v-for="app in detailPosting.applications" :key="app.id" class="flex items-center justify-between px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ app.firstName }} {{ app.lastName }}</p>
                  <p class="text-xs text-gray-500">{{ app.email }} · {{ formatDate(app.createdAt) }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="appStatusBadge(app.status)" class="text-xs">{{ appStatusLabel(app.status) }}</span>
                  <select v-if="isAdminOrResponsable" @change="updateAppStatus(app, ($event.target as HTMLSelectElement).value)" class="input text-xs py-0.5 px-1">
                    <option v-for="s in appStatuses" :key="s.value" :value="s.value" :selected="app.status === s.value">{{ s.label }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppModal :show="showCreateModal" title="Nouvelle offre" @close="showCreateModal = false">
      <form @submit.prevent="createPosting" class="space-y-4">
        <div>
          <label class="label">Titre *</label>
          <input v-model="form.title" type="text" class="input" required />
        </div>
        <div>
          <label class="label">Description *</label>
          <textarea v-model="form.description" class="input" rows="4" required />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Statut</label>
            <select v-model="form.status" class="input">
              <option value="draft">Brouillon</option>
              <option value="published">Publiée</option>
            </select>
          </div>
          <div>
            <label class="label">Postes disponibles</label>
            <input v-model.number="form.slots" type="number" min="1" class="input" />
          </div>
        </div>
        <div>
          <label class="label">Pôle</label>
          <select v-model="form.poleId" class="input">
            <option :value="null">Tous pôles</option>
            <option v-for="p in poles" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
      </form>
      <template #footer>
        <button @click="showCreateModal = false" class="btn-secondary">Annuler</button>
        <button @click="createPosting" :disabled="saving" class="btn-primary">
          {{ saving ? 'Création...' : 'Créer' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { JobPosting, Application, Pole } from '~/types'

definePageMeta({ middleware: 'auth' })

const { isAdminOrResponsable } = useAuth()
const toast = useToast()

const { data: postings, pending, refresh } = useFetch<JobPosting[]>('/api/recrutement')
const { data: poles } = useFetch<Pole[]>('/api/poles')

const selected = ref<JobPosting | null>(null)
const detailPosting = ref<JobPosting | null>(null)
const showCreateModal = ref(false)
const saving = ref(false)

const form = reactive({
  title: '',
  description: '',
  status: 'draft' as string,
  slots: 1,
  poleId: null as number | null,
})

const appStatuses = [
  { value: 'new', label: 'Nouveau', badge: 'badge badge-gray' },
  { value: 'reviewing', label: 'En cours', badge: 'badge badge-blue' },
  { value: 'interview', label: 'Entretien', badge: 'badge badge-yellow' },
  { value: 'accepted', label: 'Accepté', badge: 'badge badge-green' },
  { value: 'rejected', label: 'Refusé', badge: 'badge badge-red' },
]

const statusBadge = (s: string) => ({ draft: 'badge badge-gray', published: 'badge badge-green', closed: 'badge badge-red' }[s] ?? 'badge')
const statusLabel = (s: string) => ({ draft: 'Brouillon', published: 'Publiée', closed: 'Fermée' }[s] ?? s)
const appStatusBadge = (s: string) => appStatuses.find(a => a.value === s)?.badge ?? 'badge'
const appStatusLabel = (s: string) => appStatuses.find(a => a.value === s)?.label ?? s

const countByStatus = (status: string) => detailPosting.value?.applications?.filter(a => a.status === status).length ?? 0
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : ''

const selectPosting = async (p: JobPosting) => {
  selected.value = p
  try {
    detailPosting.value = await $fetch<JobPosting>(`/api/recrutement/${p.id}`)
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const updateStatus = async (p: JobPosting, status: string) => {
  try {
    await $fetch(`/api/recrutement/${p.id}`, { method: 'PATCH', body: { status } })
    toast.success('Statut mis à jour')
    refresh()
    if (selected.value?.id === p.id) await selectPosting({ ...p, status } as JobPosting)
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const updateAppStatus = async (app: Application, status: string) => {
  try {
    await $fetch(`/api/recrutement/applications/${app.id}`, { method: 'PATCH', body: { status } })
    toast.success('Statut mis à jour')
    if (selected.value) await selectPosting(selected.value)
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const createPosting = async () => {
  if (!form.title.trim() || !form.description.trim()) return
  saving.value = true
  try {
    await $fetch('/api/recrutement', { method: 'POST', body: { ...form, poleId: form.poleId || null } })
    toast.success('Offre créée')
    showCreateModal.value = false
    Object.assign(form, { title: '', description: '', status: 'draft', slots: 1, poleId: null })
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    saving.value = false
  }
}
</script>
