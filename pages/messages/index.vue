<template>
  <div class="space-y-0">
    <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
      <h1 class="page-title mb-0">💬 Messages</h1>
      <button @click="showNewModal = true" class="btn-primary text-sm">✉️ Nouveau message</button>
    </div>

    <div class="flex h-[calc(100vh-220px)] min-h-[400px]">
      <!-- Thread list -->
      <div class="w-full sm:w-72 lg:w-80 border-r border-gray-100 dark:border-gray-700 overflow-y-auto flex-shrink-0">
        <div v-if="threadsPending" class="p-8"><LoadingSpinner /></div>
        <div v-else-if="!threads?.length" class="p-4">
          <EmptyState icon="💬" title="Aucune conversation" description="Démarrez une nouvelle conversation" />
        </div>
        <div v-else>
          <div
            v-for="t in threads"
            :key="t.id"
            @click="selectThread(t)"
            class="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-700"
            :class="activeThread?.id === t.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''"
          >
            <div class="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-sm flex-shrink-0">
              💬
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ t.subject || otherParticipants(t) }}
                </p>
                <span v-if="t.unreadCount" class="badge badge-blue text-xs flex-shrink-0">{{ t.unreadCount }}</span>
              </div>
              <p class="text-xs text-gray-500 truncate mt-0.5">
                {{ t.messages?.[0]?.content ?? '' }}
              </p>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(t.updatedAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages panel -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <div v-if="!activeThread" class="flex-1 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <div class="text-4xl mb-2">💬</div>
            <p>Sélectionnez une conversation</p>
          </div>
        </div>
        <template v-else>
          <div class="p-4 border-b border-gray-100 dark:border-gray-700">
            <p class="font-semibold text-gray-900 dark:text-white">
              {{ activeThread.subject || otherParticipants(activeThread) }}
            </p>
          </div>
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-if="messagesPending" class="flex justify-center"><LoadingSpinner /></div>
            <div
              v-for="msg in threadDetail?.messages"
              :key="msg.id"
              class="flex gap-3"
              :class="msg.senderId === currentUser?.id ? 'flex-row-reverse' : ''"
            >
              <div class="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400 flex-shrink-0">
                {{ msg.sender?.prenom?.[0] }}{{ msg.sender?.nom?.[0] }}
              </div>
              <div
                class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm"
                :class="msg.senderId === currentUser?.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'"
              >
                <p>{{ msg.content }}</p>
                <p class="text-xs opacity-60 mt-1">{{ formatTime(msg.createdAt) }}</p>
              </div>
            </div>
          </div>
          <form @submit.prevent="sendMessage" class="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              class="input flex-1"
              placeholder="Écrire un message..."
              :disabled="sending"
            />
            <button type="submit" :disabled="!newMessage.trim() || sending" class="btn-primary flex-shrink-0">
              {{ sending ? '...' : '➤' }}
            </button>
          </form>
        </template>
      </div>
    </div>
  </div>

  <!-- New thread modal -->
  <AppModal :show="showNewModal" title="Nouveau message" @close="showNewModal = false">
    <form @submit.prevent="createThread" class="space-y-4">
      <div>
        <label class="label">Destinataire(s)</label>
        <div class="space-y-2">
          <div v-for="(uid, i) in newForm.participantIds" :key="i" class="flex gap-2">
            <select v-model="newForm.participantIds[i]" class="input flex-1">
              <option :value="null">Sélectionner...</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.prenom }} {{ u.nom }}</option>
            </select>
            <button type="button" @click="newForm.participantIds.splice(i, 1)" class="btn-danger text-sm px-2">✕</button>
          </div>
          <button type="button" @click="newForm.participantIds.push(null as any)" class="text-sm text-indigo-600 hover:text-indigo-700">+ Ajouter</button>
        </div>
      </div>
      <div>
        <label class="label">Sujet (optionnel)</label>
        <input v-model="newForm.subject" type="text" class="input" />
      </div>
      <div>
        <label class="label">Message *</label>
        <textarea v-model="newForm.message" class="input" rows="4" required />
      </div>
    </form>
    <template #footer>
      <button @click="showNewModal = false" class="btn-secondary">Annuler</button>
      <button @click="createThread" :disabled="creatingThread" class="btn-primary">
        {{ creatingThread ? 'Envoi...' : 'Envoyer' }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import type { User } from '~/types'

definePageMeta({ middleware: 'auth' })

const { user: currentUser } = useAuth()
const toast = useToast()

const { data: threads, pending: threadsPending, refresh: refreshThreads } = useFetch<any[]>('/api/messages')
const { data: users } = useFetch<User[]>('/api/users')

const activeThread = ref<any | null>(null)
const threadDetail = ref<any | null>(null)
const messagesPending = ref(false)
const showNewModal = ref(false)
const newMessage = ref('')
const sending = ref(false)
const creatingThread = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const newForm = reactive({
  participantIds: [null as any],
  subject: '',
  message: '',
})

const otherParticipants = (thread: any) => {
  const others = thread.participants?.filter((p: any) => p.userId !== currentUser.value?.id) ?? []
  return others.map((p: any) => `${p.user?.prenom} ${p.user?.nom}`).join(', ') || 'Conversation'
}

const formatDate = (d: string) => {
  const date = new Date(d)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
const formatTime = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

const selectThread = async (thread: any) => {
  activeThread.value = thread
  messagesPending.value = true
  try {
    threadDetail.value = await $fetch<any>(`/api/messages/${thread.id}`)
    await nextTick()
    if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    refreshThreads()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    messagesPending.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeThread.value) return
  sending.value = true
  try {
    await $fetch(`/api/messages/${activeThread.value.id}`, { method: 'POST', body: { content: newMessage.value } })
    newMessage.value = ''
    await selectThread(activeThread.value)
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    sending.value = false
  }
}

const createThread = async () => {
  const validIds = newForm.participantIds.filter(Boolean)
  if (!validIds.length || !newForm.message.trim()) return
  creatingThread.value = true
  try {
    const thread = await $fetch<any>('/api/messages', {
      method: 'POST',
      body: {
        participantIds: validIds,
        subject: newForm.subject || null,
        message: newForm.message,
      },
    })
    toast.success('Conversation créée')
    showNewModal.value = false
    Object.assign(newForm, { participantIds: [null], subject: '', message: '' })
    await refreshThreads()
    await selectThread(thread)
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Erreur')
  } finally {
    creatingThread.value = false
  }
}
</script>
