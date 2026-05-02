<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="page-title">⭐ Points</h1>
    </div>

    <!-- Balance -->
    <div class="card p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 uppercase tracking-wide">Solde actuel</p>
          <p class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {{ data?.balance ?? 0 }} <span class="text-lg font-normal text-gray-500">pts</span>
          </p>
        </div>
        <div class="text-6xl">💎</div>
      </div>
    </div>

    <!-- Admin: add transaction -->
    <div v-if="isAdmin" class="card p-5">
      <h2 class="section-title mb-4">Attribuer des points</h2>
      <form @submit.prevent="addTransaction" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label class="label">Utilisateur</label>
          <select v-model="form.userId" class="input" required>
            <option :value="null">Sélectionner...</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.prenom }} {{ u.nom }}</option>
          </select>
        </div>
        <div>
          <label class="label">Montant</label>
          <input v-model.number="form.amount" type="number" min="1" class="input" required />
        </div>
        <div>
          <label class="label">Type</label>
          <select v-model="form.type" class="input">
            <option value="credit">Crédit (+)</option>
            <option value="debit">Débit (-)</option>
          </select>
        </div>
        <div>
          <label class="label">Mois (YYYY-MM)</label>
          <input v-model="form.month" type="month" class="input" required />
        </div>
        <div class="sm:col-span-2">
          <label class="label">Raison</label>
          <input v-model="form.reason" type="text" class="input" required />
        </div>
        <div class="flex items-end">
          <button type="submit" :disabled="saving" class="btn-primary w-full">
            {{ saving ? 'Enregistrement...' : 'Ajouter' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Transaction history -->
    <div class="card overflow-hidden">
      <div class="p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 class="section-title">Historique</h2>
      </div>
      <div v-if="pending" class="p-8"><LoadingSpinner /></div>
      <div v-else-if="!data?.transactions?.length">
        <EmptyState icon="⭐" title="Aucune transaction" description="Votre historique de points apparaîtra ici" />
      </div>
      <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
        <div v-for="t in data.transactions" :key="t.id" class="flex items-center justify-between px-4 py-3">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t.reason }}</p>
            <p class="text-xs text-gray-500">{{ t.month }} · {{ formatDate(t.createdAt) }}</p>
          </div>
          <div class="text-right">
            <p :class="t.type === 'credit' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'">
              {{ t.type === 'credit' ? '+' : '-' }}{{ t.amount }} pts
            </p>
            <span v-if="t.validatedAt" class="badge badge-green text-xs">Validé</span>
            <span v-else class="badge badge-gray text-xs">En attente</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types'

definePageMeta({ middleware: 'auth' })

const { isAdmin } = useAuth()
const toast = useToast()

const { data, pending, refresh } = useFetch<{ balance: number; transactions: any[] }>('/api/points')
const { data: users } = useFetch<User[]>('/api/users')

const saving = ref(false)
const form = reactive({
  userId: null as number | null,
  amount: 10,
  type: 'credit' as string,
  reason: '',
  month: new Date().toISOString().slice(0, 7),
})

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')

const addTransaction = async () => {
  if (!form.userId) return
  saving.value = true
  try {
    await $fetch('/api/points', { method: 'POST', body: form })
    toast.success('Transaction enregistrée')
    Object.assign(form, { userId: null, amount: 10, type: 'credit', reason: '', month: new Date().toISOString().slice(0, 7) })
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    saving.value = false
  }
}
</script>
