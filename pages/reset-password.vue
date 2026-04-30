<template>
  <div class="w-full max-w-md">
    <div class="card p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span class="text-white font-bold text-3xl">B</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ token ? 'Nouveau mot de passe' : 'Mot de passe oublié' }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {{ token ? 'Choisissez un nouveau mot de passe pour votre compte' : 'Entrez votre adresse email pour recevoir un lien de réinitialisation' }}
        </p>
      </div>

      <!-- Forgot-password form -->
      <form v-if="!token && !done" @submit.prevent="handleForgot" class="space-y-4">
        <div>
          <label for="email" class="label">Adresse email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="input"
            placeholder="votre@email.com"
            :disabled="loading"
          />
        </div>

        <div v-if="errorMessage" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full py-2.5">
          <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ loading ? 'Envoi...' : 'Envoyer le lien' }}
        </button>

        <p class="text-center text-sm text-gray-500">
          <NuxtLink to="/login" class="text-indigo-600 hover:underline dark:text-indigo-400">Retour à la connexion</NuxtLink>
        </p>
      </form>

      <!-- Success message after requesting reset -->
      <div v-else-if="!token && done" class="text-center space-y-4">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300">{{ successMessage }}</p>
        <NuxtLink to="/login" class="btn-primary inline-block px-6 py-2.5">Retour à la connexion</NuxtLink>
      </div>

      <!-- Reset-password form (token present) -->
      <form v-else-if="token" @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label for="password" class="label">Nouveau mot de passe *</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input"
            minlength="8"
            required
            placeholder="Minimum 8 caractères"
            :disabled="loading"
          />
        </div>

        <div>
          <label for="confirm" class="label">Confirmer le mot de passe *</label>
          <input
            id="confirm"
            v-model="form.confirm"
            type="password"
            class="input"
            minlength="8"
            required
            placeholder="Répétez le mot de passe"
            :disabled="loading"
          />
        </div>

        <div v-if="errorMessage" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full py-2.5">
          <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}
        </button>

        <p class="text-center text-sm text-gray-500">
          <NuxtLink to="/login" class="text-indigo-600 hover:underline dark:text-indigo-400">Retour à la connexion</NuxtLink>
        </p>
      </form>
    </div>

    <p class="text-center text-xs text-gray-400 mt-6">
      🔒 Accès privé — usage interne uniquement
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)

const email = ref('')
const form = reactive({ password: '', confirm: '' })
const loading = ref(false)
const errorMessage = ref('')
const done = ref(false)
const successMessage = ref('')

const handleForgot = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    const data = await $fetch<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })
    successMessage.value = data.message
    done.value = true
  } catch (e: any) {
    errorMessage.value = e?.data?.message ?? 'Erreur lors de la demande'
  } finally {
    loading.value = false
  }
}

const handleReset = async () => {
  if (form.password !== form.confirm) {
    errorMessage.value = 'Les mots de passe ne correspondent pas'
    return
  }
  errorMessage.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, password: form.password },
    })
    await navigateTo('/login')
  } catch (e: any) {
    errorMessage.value = e?.data?.message ?? 'Erreur lors de la réinitialisation'
  } finally {
    loading.value = false
  }
}
</script>
