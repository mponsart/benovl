<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <NuxtLink to="/rh" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="page-title">Nouveau bénévole</h1>
    </div>

    <div class="card p-6">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Prénom *</label>
            <input v-model="form.prenom" type="text" class="input" required />
          </div>
          <div>
            <label class="label">Nom *</label>
            <input v-model="form.nom" type="text" class="input" required />
          </div>
        </div>

        <div>
          <label class="label">Email *</label>
          <input v-model="form.email" type="email" class="input" required />
        </div>

        <div>
          <label class="label">Mot de passe *</label>
          <input v-model="form.password" type="password" class="input" minlength="8" required placeholder="Minimum 8 caractères" />
        </div>

        <div>
          <label class="label">Téléphone</label>
          <input v-model="form.telephone" type="tel" class="input" placeholder="06 XX XX XX XX" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Rôle *</label>
            <select v-model="form.role" class="input">
              <option value="benevole">Bénévole</option>
              <option value="responsable">Responsable</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label class="label">Pôle</label>
            <select v-model="form.poleId" class="input">
              <option :value="null">Aucun pôle</option>
              <option v-for="p in poles" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="label">Notes internes</label>
          <textarea v-model="form.notesInternes" class="input" rows="3" placeholder="Notes visibles uniquement par les admins et responsables" />
        </div>

        <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">{{ error }}</div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <NuxtLink to="/rh" class="btn-secondary">Annuler</NuxtLink>
          <button type="submit" :disabled="loading" class="btn-primary">
            <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ loading ? 'Création...' : 'Créer le compte' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pole } from '~/types'

definePageMeta({ middleware: ['auth', 'admin'] })

const toast = useToast()
const router = useRouter()

const { data: poles } = useFetch<Pole[]>('/api/poles')

const form = reactive({
  prenom: '',
  nom: '',
  email: '',
  password: '',
  telephone: '',
  role: 'benevole' as 'admin' | 'responsable' | 'benevole',
  poleId: null as number | null,
  notesInternes: '',
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/users', { method: 'POST', body: form })
    toast.success('Compte créé avec succès')
    router.push('/rh')
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Erreur lors de la création'
  } finally {
    loading.value = false
  }
}
</script>
