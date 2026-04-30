<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="text-5xl mb-4">{{ icon }}</div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ title }}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">{{ description }}</p>
    <slot />
  </div>
</template>
<script setup lang="ts">
defineProps<{ icon?: string; title: string; description?: string }>()
</script>
