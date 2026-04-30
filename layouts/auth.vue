<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
    <slot />
    <AppToast />
  </div>
</template>

<script setup lang="ts">
const { init: initDark } = useDarkMode()
onMounted(() => initDark())
</script>
