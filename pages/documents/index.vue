<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <h1 class="page-title">Documents</h1>
      <button v-if="isAdminOrResponsable" @click="showCreateModal = true" class="btn-primary text-sm">➕ Ajouter un document</button>
    </div>

    <!-- Documents grid -->
    <div v-if="pending"><LoadingSpinner /></div>
    <div v-else-if="!documents?.length">
      <EmptyState icon="📄" title="Aucun document" description="Aucun document disponible pour le moment" />
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="card p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-3">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0', docTypeColor(doc.type)]">
            {{ docTypeIcon(doc.type) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ doc.name }}</p>
            <p class="text-xs text-gray-500 mt-0.5">
              <span :class="docBadgeClass(doc.type)">{{ docTypeLabel(doc.type) }}</span>
              <span v-if="doc.size" class="ml-2">{{ formatSize(doc.size) }}</span>
            </p>
            <p v-if="doc.user" class="text-xs text-gray-400 mt-1">{{ doc.user.prenom }} {{ doc.user.nom }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(doc.createdAt) }}</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button v-if="isAdminOrResponsable" @click="deleteDoc(doc)" class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <AppModal :show="showCreateModal" title="Ajouter un document" @close="showCreateModal = false">
      <form @submit.prevent="handleCreate" class="space-y-4">
        <div>
          <label class="label">Nom du document *</label>
          <input v-model="form.name" type="text" class="input" required placeholder="Ex: Attestation bénévole 2024" />
        </div>
        <div>
          <label class="label">Nom du fichier *</label>
          <input v-model="form.filename" type="text" class="input" required placeholder="Ex: attestation-2024.pdf" />
        </div>
        <div>
          <label class="label">Type *</label>
          <select v-model="form.type" class="input">
            <option value="attestation">Attestation</option>
            <option value="convention">Convention</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div>
          <label class="label">Bénévole concerné</label>
          <select v-model="form.userId" class="input">
            <option :value="null">Document général</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.prenom }} {{ u.nom }}</option>
          </select>
        </div>
        <div v-if="formError" class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">{{ formError }}</div>
      </form>
      <template #footer>
        <button @click="showCreateModal = false" class="btn-secondary">Annuler</button>
        <button @click="handleCreate" :disabled="saving" class="btn-primary">
          {{ saving ? 'Enregistrement...' : 'Ajouter' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Document, User } from '~/types'

definePageMeta({ middleware: 'auth' })

const { isAdminOrResponsable } = useAuth()
const toast = useToast()

const showCreateModal = ref(false)
const saving = ref(false)
const formError = ref('')

const { data: documents, pending, refresh } = useFetch<Document[]>('/api/documents')
const { data: users } = useFetch<User[]>('/api/users')

const form = reactive({ name: '', filename: '', type: 'autre' as 'attestation' | 'convention' | 'autre', userId: null as number | null })

const handleCreate = async () => {
  formError.value = ''
  saving.value = true
  try {
    await $fetch('/api/documents', { method: 'POST', body: form })
    toast.success('Document ajouté')
    showCreateModal.value = false
    Object.assign(form, { name: '', filename: '', type: 'autre', userId: null })
    refresh()
  } catch (e: any) {
    formError.value = e?.data?.message ?? 'Erreur'
  } finally {
    saving.value = false
  }
}

const deleteDoc = async (doc: Document) => {
  if (!confirm(`Supprimer "${doc.name}" ?`)) return
  try {
    await $fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
    toast.success('Document supprimé')
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const docTypeIcon = (t: string) => ({ attestation: '📜', convention: '📋', autre: '📄' }[t] ?? '📄')
const docTypeLabel = (t: string) => ({ attestation: 'Attestation', convention: 'Convention', autre: 'Autre' }[t] ?? 'Autre')
const docTypeColor = (t: string) => ({ attestation: 'bg-yellow-100 dark:bg-yellow-900/30', convention: 'bg-blue-100 dark:bg-blue-900/30', autre: 'bg-gray-100 dark:bg-gray-700' }[t] ?? 'bg-gray-100')
const docBadgeClass = (t: string) => ({ attestation: 'badge badge-yellow', convention: 'badge badge-blue', autre: 'badge' }[t] ?? 'badge')
const formatSize = (bytes: number) => bytes < 1024 ? `${bytes}o` : bytes < 1048576 ? `${(bytes/1024).toFixed(0)}Ko` : `${(bytes/1048576).toFixed(1)}Mo`
const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
</script>
