<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
    <AppSidebar :is-open="sidebarOpen" :mobile-open="mobileSidebarOpen" @toggle="sidebarOpen = !sidebarOpen" @close-mobile="mobileSidebarOpen = false" />
    <div :class="['flex flex-col flex-1 overflow-hidden transition-all duration-300', sidebarOpen ? 'md:ml-64' : 'md:ml-16']">
      <AppHeader @toggle-mobile="mobileSidebarOpen = true" />
      <main class="flex-1 overflow-auto p-4 md:p-6">
        <slot />
      </main>
    </div>
    <AppToast />
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)

const { init: initDark } = useDarkMode()
onMounted(() => initDark())
</script>
