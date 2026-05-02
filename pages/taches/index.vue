<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="page-title">📋 Tâches</h1>
      <button @click="showCreateModal = true" class="btn-primary text-sm">➕ Nouvelle tâche</button>
    </div>

    <div v-if="pending" class="p-8"><LoadingSpinner /></div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="col in columns" :key="col.status" class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">{{ col.label }}</h2>
          <span class="badge badge-gray text-xs">{{ tasksByStatus(col.status).length }}</span>
        </div>
        <div class="space-y-2 min-h-[200px]">
          <div
            v-for="task in tasksByStatus(col.status)"
            :key="task.id"
            class="card p-3 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium text-gray-900 dark:text-white leading-tight">{{ task.title }}</p>
              <span :class="priorityBadge(task.priority)" class="text-xs flex-shrink-0">{{ priorityLabel(task.priority) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span v-if="task.assignedTo">👤 {{ task.assignedTo.prenom }} {{ task.assignedTo.nom }}</span>
              <span v-else class="text-gray-400">Non assigné</span>
              <span v-if="task.dueDate" :class="isOverdue(task.dueDate) ? 'text-red-500' : ''">
                📅 {{ formatDate(task.dueDate) }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button @click="moveTask(task, col.status, 'prev')" v-if="col.status !== 'todo'" class="p-1 rounded text-gray-400 hover:text-gray-600 text-xs">◀</button>
              <button @click="moveTask(task, col.status, 'next')" v-if="col.status !== 'done'" class="p-1 rounded text-gray-400 hover:text-gray-600 text-xs ml-auto">▶</button>
              <button @click="deleteTask(task)" class="p-1 rounded text-gray-400 hover:text-red-500 text-xs">🗑</button>
            </div>
          </div>
          <EmptyState v-if="!tasksByStatus(col.status).length" icon="📋" title="" description="Aucune tâche" class="py-4" />
        </div>
      </div>
    </div>

    <AppModal :show="showCreateModal" title="Nouvelle tâche" @close="showCreateModal = false">
      <form @submit.prevent="createTask" class="space-y-4">
        <div>
          <label class="label">Titre *</label>
          <input v-model="form.title" type="text" class="input" required />
        </div>
        <div>
          <label class="label">Description</label>
          <textarea v-model="form.description" class="input" rows="3" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Priorité</label>
            <select v-model="form.priority" class="input">
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          <div>
            <label class="label">Échéance</label>
            <input v-model="form.dueDate" type="date" class="input" />
          </div>
        </div>
        <div>
          <label class="label">Assigné à</label>
          <select v-model="form.assignedToId" class="input">
            <option :value="null">Non assigné</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.prenom }} {{ u.nom }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.isCollective" type="checkbox" id="isCollective" class="rounded" />
          <label for="isCollective" class="text-sm text-gray-700 dark:text-gray-300">Tâche collective</label>
        </div>
      </form>
      <template #footer>
        <button @click="showCreateModal = false" class="btn-secondary">Annuler</button>
        <button @click="createTask" :disabled="saving" class="btn-primary">
          {{ saving ? 'Création...' : 'Créer' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Task, User } from '~/types'

definePageMeta({ middleware: 'auth' })

const toast = useToast()

const columns = [
  { status: 'todo', label: 'À faire' },
  { status: 'in_progress', label: 'En cours' },
  { status: 'review', label: 'En revue' },
  { status: 'done', label: 'Terminé' },
]

const statusOrder = ['todo', 'in_progress', 'review', 'done']

const { data: tasks, pending, refresh } = useFetch<Task[]>('/api/tasks')
const { data: users } = useFetch<User[]>('/api/users')

const showCreateModal = ref(false)
const saving = ref(false)

const form = reactive({
  title: '',
  description: '',
  priority: 'medium' as string,
  dueDate: '',
  assignedToId: null as number | null,
  isCollective: false,
})

const tasksByStatus = (status: string) => (tasks.value ?? []).filter(t => t.status === status)

const priorityBadge = (p: string) => ({
  low: 'badge badge-gray',
  medium: 'badge badge-blue',
  high: 'badge badge-yellow',
  urgent: 'badge badge-red',
}[p] ?? 'badge badge-gray')

const priorityLabel = (p: string) => ({ low: 'Faible', medium: 'Moyenne', high: 'Haute', urgent: 'Urgente' }[p] ?? p)

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''
const isOverdue = (d: string) => d && new Date(d) < new Date()

const moveTask = async (task: Task, currentStatus: string, direction: 'prev' | 'next') => {
  const idx = statusOrder.indexOf(currentStatus)
  const newStatus = direction === 'next' ? statusOrder[idx + 1] : statusOrder[idx - 1]
  if (!newStatus) return
  try {
    await $fetch(`/api/tasks/${task.id}`, { method: 'PATCH', body: { status: newStatus } })
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const deleteTask = async (task: Task) => {
  if (!confirm(`Supprimer "${task.title}" ?`)) return
  try {
    await $fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
    toast.success('Tâche supprimée')
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  }
}

const resetForm = () => Object.assign(form, { title: '', description: '', priority: 'medium', dueDate: '', assignedToId: null, isCollective: false })

const createTask = async () => {
  if (!form.title.trim()) return
  saving.value = true
  try {
    await $fetch('/api/tasks', {
      method: 'POST',
      body: {
        ...form,
        dueDate: form.dueDate || null,
        assignedToId: form.assignedToId || null,
      },
    })
    toast.success('Tâche créée')
    showCreateModal.value = false
    resetForm()
    refresh()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    saving.value = false
  }
}
</script>
