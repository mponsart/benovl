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

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="flex gap-1 -mb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.id
            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab: Info -->
    <template v-if="activeTab === 'info'">
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
    </template>

    <!-- Tab: Lifecycle -->
    <template v-if="activeTab === 'lifecycle'">
      <div class="card p-5 space-y-4" v-if="isAdminOrResponsable">
        <h2 class="section-title">Changer le statut parcours</h2>
        <div class="flex flex-wrap gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Statut actuel :</span>
          <span :class="lifecycleBadge(user.lifecycle)" class="text-sm">{{ lifecycleLabel(user.lifecycle) }}</span>
        </div>
        <form @submit.prevent="changeLifecycle" class="flex flex-col sm:flex-row gap-3">
          <select v-model="lifecycleForm.toStatus" class="input flex-1">
            <option value="actif">Actif</option>
            <option value="pause">En pause</option>
            <option value="suspendu">Suspendu</option>
            <option value="sorti">Sorti</option>
          </select>
          <input v-model="lifecycleForm.reason" type="text" class="input flex-1" placeholder="Raison (optionnel)" />
          <button type="submit" :disabled="changingLifecycle" class="btn-primary flex-shrink-0">
            {{ changingLifecycle ? 'Enregistrement...' : 'Changer' }}
          </button>
        </form>
      </div>

      <div class="card overflow-hidden">
        <div class="p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 class="section-title">📜 Historique du parcours</h2>
        </div>
        <div v-if="lifecycleEvents?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
          <div v-for="ev in lifecycleEvents" :key="ev.id" class="flex items-center justify-between px-5 py-3">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                <span :class="lifecycleBadge(ev.fromStatus)" class="text-xs">{{ lifecycleLabel(ev.fromStatus) }}</span>
                → <span :class="lifecycleBadge(ev.toStatus)" class="text-xs">{{ lifecycleLabel(ev.toStatus) }}</span>
              </p>
              <p class="text-xs text-gray-500 mt-1">{{ ev.reason ?? '—' }}</p>
            </div>
            <div class="text-right text-xs text-gray-400">
              <p>{{ ev.changedBy ? `${ev.changedBy.prenom} ${ev.changedBy.nom}` : '—' }}</p>
              <p>{{ formatDate(ev.createdAt) }}</p>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="📜" title="Aucun événement" description="Aucun changement de statut enregistré" />
      </div>
    </template>

    <!-- Tab: Skills -->
    <template v-if="activeTab === 'skills'">
      <div class="card p-5 space-y-4" v-if="isAdminOrResponsable">
        <h2 class="section-title">Ajouter une compétence</h2>
        <form @submit.prevent="addSkill" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="label">Nom *</label>
            <input v-model="skillForm.name" type="text" class="input" required />
          </div>
          <div>
            <label class="label">Niveau *</label>
            <select v-model="skillForm.level" class="input">
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <label class="label">Catégorie</label>
            <input v-model="skillForm.category" type="text" class="input" placeholder="Ex: Technique, Communication..." />
          </div>
          <div>
            <label class="label">Date d'obtention</label>
            <input v-model="skillForm.obtainedAt" type="date" class="input" />
          </div>
          <div class="sm:col-span-2">
            <button type="submit" :disabled="addingSkill" class="btn-primary">
              {{ addingSkill ? 'Enregistrement...' : '+ Ajouter' }}
            </button>
          </div>
        </form>
      </div>

      <div class="card overflow-hidden">
        <div class="p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 class="section-title">🎯 Compétences</h2>
        </div>
        <div v-if="skills?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
          <div v-for="sk in skills" :key="sk.id" class="flex items-center justify-between px-5 py-3">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ sk.name }}</p>
              <p class="text-xs text-gray-500">{{ sk.category ?? '—' }}</p>
            </div>
            <div class="text-right">
              <span :class="skillLevelBadge(sk.level)" class="text-xs">{{ skillLevelLabel(sk.level) }}</span>
              <p v-if="sk.obtainedAt" class="text-xs text-gray-400 mt-1">{{ formatDate(sk.obtainedAt) }}</p>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="🎯" title="Aucune compétence" description="Ajoutez des compétences au profil" />
      </div>
    </template>
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
import type { User, Pole, LifecycleEvent, Skill } from '~/types'

definePageMeta({ middleware: ['auth', 'admin-or-responsable'] })

const route = useRoute()
const { isAdmin, isAdminOrResponsable } = useAuth()
const toast = useToast()

const tabs = [
  { id: 'info', label: '👤 Infos' },
  { id: 'lifecycle', label: '🔄 Parcours' },
  { id: 'skills', label: '🎯 Compétences' },
]
const activeTab = ref('info')

const { data: user, pending, refresh } = useFetch<User & { registrations: any[] }>(`/api/users/${route.params.id}`)
const { data: poles } = useFetch<Pole[]>('/api/poles')
const { data: lifecycleEvents, refresh: refreshLifecycle } = useFetch<LifecycleEvent[]>(`/api/users/${route.params.id}/lifecycle-events`, { default: () => [] })
const { data: skills, refresh: refreshSkills } = useFetch<Skill[]>(`/api/users/${route.params.id}/skills`, { default: () => [] })

const showEditModal = ref(false)
const updating = ref(false)
const inviteUrl = ref('')

// Edit form
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

// Lifecycle
const lifecycleForm = reactive({ toStatus: 'actif' as string, reason: '' })
const changingLifecycle = ref(false)

const changeLifecycle = async () => {
  changingLifecycle.value = true
  try {
    await $fetch(`/api/users/${route.params.id}/lifecycle`, {
      method: 'POST',
      body: { toStatus: lifecycleForm.toStatus, reason: lifecycleForm.reason || null },
    })
    toast.success('Statut mis à jour')
    lifecycleForm.reason = ''
    refresh()
    refreshLifecycle()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    changingLifecycle.value = false
  }
}

// Skills
const skillForm = reactive({ name: '', level: 'intermediaire' as string, category: '', obtainedAt: '' })
const addingSkill = ref(false)

const addSkill = async () => {
  if (!skillForm.name.trim()) return
  addingSkill.value = true
  try {
    await $fetch(`/api/users/${route.params.id}/skills`, {
      method: 'POST',
      body: { ...skillForm, category: skillForm.category || null, obtainedAt: skillForm.obtainedAt || null },
    })
    toast.success('Compétence ajoutée')
    Object.assign(skillForm, { name: '', level: 'intermediaire', category: '', obtainedAt: '' })
    refreshSkills()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    addingSkill.value = false
  }
}

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
const lifecycleBadge = (s: string) => ({ actif: 'badge badge-green', pause: 'badge badge-yellow', suspendu: 'badge badge-red', sorti: 'badge badge-gray' }[s] ?? 'badge')
const lifecycleLabel = (s: string) => ({ actif: 'Actif', pause: 'En pause', suspendu: 'Suspendu', sorti: 'Sorti' }[s] ?? s)
const skillLevelBadge = (l: string) => ({ debutant: 'badge badge-gray', intermediaire: 'badge badge-blue', avance: 'badge badge-yellow', expert: 'badge badge-green' }[l] ?? 'badge')
const skillLevelLabel = (l: string) => ({ debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé', expert: 'Expert' }[l] ?? l)
</script>
