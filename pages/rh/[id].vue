<template>
  <div class="max-w-3xl mx-auto space-y-6" v-if="user">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <NuxtLink to="/rh" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <div class="flex-1">
        <h1 class="page-title">{{ user.prenom }} {{ user.nom }}</h1>
        <p class="text-sm text-gray-500">{{ user.email }}</p>
      </div>
      <div class="flex gap-2" v-if="isAdmin">
        <button @click="showEditModal = true" class="btn-secondary text-sm">✏️ Modifier</button>
        <button v-if="user.status === 'actif'" @click="handleDeactivate" class="btn-danger text-sm">🚫 Désactiver</button>
        <button @click="generateInvite" class="btn-secondary text-sm">📧 Invitation</button>
      </div>
    </div>

    <!-- Profile Card -->
    <div class="card p-6">
      <div class="flex items-start gap-4">
        <div class="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xl flex-shrink-0">
          {{ user.prenom[0] }}{{ user.nom[0] }}
        </div>
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Nom complet</p>
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user.prenom }} {{ user.nom }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Email</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ user.email }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Téléphone</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ user.telephone ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Pôle</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ user.pole?.name ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Rôle</p>
            <UserBadge :role="user.role" />
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Statut</p>
            <UserBadge :status="user.status" />
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Dernière connexion</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Jamais' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Membre depuis</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ formatDate(user.createdAt) }}</p>
          </div>
        </div>
      </div>

      <div v-if="user.notesInternes" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes internes</p>
        <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ user.notesInternes }}</p>
      </div>
    </div>

    <!-- Recent registrations -->
    <div class="card">
      <div class="p-5 border-b border-gray-100 dark:border-gray-700">
        <h2 class="section-title">📅 Inscriptions récentes</h2>
      </div>
      <div v-if="user.registrations?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
        <div v-for="reg in user.registrations" :key="reg.id" class="flex items-center justify-between px-5 py-3">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ reg.slot?.title }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(reg.slot?.startAt ?? '') }}</p>
          </div>
          <span :class="statusBadge(reg.status)">{{ reg.status }}</span>
        </div>
      </div>
      <EmptyState v-else icon="📅" title="Aucune inscription" description="Pas d'inscription récente" />
    </div>

    <!-- Invite URL display -->
    <div v-if="inviteUrl" class="card p-4 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
      <p class="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-2">🔗 Lien d'invitation (valable 48h)</p>
      <div class="flex items-center gap-2">
        <code class="flex-1 text-xs bg-white dark:bg-gray-800 rounded p-2 break-all">{{ inviteUrl }}</code>
        <button @click="copyInvite" class="btn-secondary text-xs flex-shrink-0">Copier</button>
      </div>
    </div>
  </div>

  <div v-else-if="pending"><LoadingSpinner /></div>
  <div v-else class="text-center py-16 text-gray-500">Utilisateur introuvable</div>

  <!-- Edit Modal -->
  <AppModal :show="showEditModal" title="Modifier le profil" size="lg" @close="showEditModal = false">
    <form @submit.prevent="handleUpdate" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="label">Prénom</label>
          <input v-model="editForm.prenom" type="text" class="input" />
        </div>
        <div>
          <label class="label">Nom</label>
          <input v-model="editForm.nom" type="text" class="input" />
        </div>
      </div>
      <div>
        <label class="label">Email</label>
        <input v-model="editForm.email" type="email" class="input" />
      </div>
      <div>
        <label class="label">Téléphone</label>
        <input v-model="editForm.telephone" type="tel" class="input" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="label">Rôle</label>
          <select v-model="editForm.role" class="input">
            <option value="benevole">Bénévole</option>
            <option value="responsable">Responsable</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label class="label">Pôle</label>
          <select v-model="editForm.poleId" class="input">
            <option :value="null">Aucun</option>
            <option v-for="p in poles" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
      </div>
      <div>
        <label class="label">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
        <input v-model="editForm.password" type="password" class="input" minlength="8" placeholder="Minimum 8 caractères" />
      </div>
      <div>
        <label class="label">Notes internes</label>
        <textarea v-model="editForm.notesInternes" class="input" rows="3" />
      </div>
    </form>
    <template #footer>
      <button @click="showEditModal = false" class="btn-secondary">Annuler</button>
      <button @click="handleUpdate" :disabled="updating" class="btn-primary">
        {{ updating ? 'Enregistrement...' : 'Enregistrer' }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import type { User, Pole } from '~/types'

definePageMeta({ middleware: ['auth', 'admin-or-responsable'] })

const route = useRoute()
const { isAdmin } = useAuth()
const toast = useToast()

const { data: user, pending, refresh } = useFetch<User & { registrations: any[] }>(`/api/users/${route.params.id}`)
const { data: poles } = useFetch<Pole[]>('/api/poles')

const showEditModal = ref(false)
const updating = ref(false)
const inviteUrl = ref('')

const editForm = reactive({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  role: 'benevole' as string,
  poleId: null as number | null,
  password: '',
  notesInternes: '',
})

watch(user, (u) => {
  if (u) {
    editForm.prenom = u.prenom
    editForm.nom = u.nom
    editForm.email = u.email
    editForm.telephone = u.telephone ?? ''
    editForm.role = u.role
    editForm.poleId = u.poleId ?? null
    editForm.notesInternes = u.notesInternes ?? ''
  }
})

const handleUpdate = async () => {
  updating.value = true
  try {
    const body: Record<string, unknown> = { ...editForm }
    if (!body.password) delete body.password
    await $fetch(`/api/users/${route.params.id}`, { method: 'PUT', body })
    toast.success('Profil mis à jour')
    showEditModal.value = false
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    updating.value = false
  }
}

const handleDeactivate = async () => {
  if (!confirm('Désactiver ce compte ?')) return
  try {
    await $fetch(`/api/users/${route.params.id}/deactivate`, { method: 'POST' })
    toast.success('Compte désactivé')
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const generateInvite = async () => {
  try {
    const data = await $fetch<{ inviteUrl: string }>(`/api/users/${route.params.id}/invite`, { method: 'POST' })
    inviteUrl.value = data.inviteUrl
    toast.success('Lien d\'invitation généré')
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const copyInvite = async () => {
  await navigator.clipboard.writeText(inviteUrl.value)
  toast.success('Lien copié !')
}

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
const statusBadge = (s: string) => ({ inscrit: 'badge badge-blue', confirme: 'badge badge-green', absent: 'badge badge-red' }[s] ?? 'badge')
</script>
