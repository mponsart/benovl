<template>
  <div class="flex items-center justify-center p-8">
    <div class="animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" :style="{ width: size + 'px', height: size + 'px' }" />
  </div>
</template>
<script setup lang="ts">
defineProps<{ size?: number }>()
const defaultSize = 40
</script>
