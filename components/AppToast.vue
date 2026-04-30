<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm text-sm font-medium transition-all', toastClass(toast.type)]"
        >
          <span class="text-lg leading-none">{{ toastIcon(toast.type) }}</span>
          <span class="flex-1">{{ toast.message }}</span>
          <button @click="remove(toast.id)" class="opacity-60 hover:opacity-100 ml-1">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()

const toastClass = (type: string) => ({
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-indigo-600 text-white',
}[type] ?? 'bg-gray-700 text-white')

const toastIcon = (type: string) => ({ success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }[type] ?? 'ℹ')
</script>

<style>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
