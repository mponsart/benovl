<template>
  <div class="w-full max-w-md">
    <!-- Card -->
    <div class="card p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span class="text-white font-bold text-3xl">B</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">BénoVL Intranet</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Accès réservé aux membres de l'association</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="label">Adresse email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            class="input"
            placeholder="votre@email.com"
            :disabled="loading"
          />
        </div>

        <div>
          <label for="password" class="label">Mot de passe</label>
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              class="input pr-10"
              placeholder="••••••••"
              :disabled="loading"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
              <svg v-if="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
          </div>
        </div>

        <div class="text-right">
          <NuxtLink to="/reset-password" class="text-sm text-indigo-600 hover:underline dark:text-indigo-400">Mot de passe oublié ?</NuxtLink>
        </div>

        <div v-if="errorMessage" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full py-2.5">
          <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
    </div>

    <p class="text-center text-xs text-gray-400 mt-6">
      🔒 Accès privé — usage interne uniquement
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login, user } = useAuth()
const { init: initDark } = useDarkMode()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

onMounted(() => initDark())

// Redirect if already logged in
watchEffect(() => {
  if (user.value) navigateTo('/dashboard')
})

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    await login(form.email, form.password)
    await navigateTo('/dashboard')
  } catch (e: any) {
    errorMessage.value = e?.data?.message ?? e?.message ?? 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}
</script>
