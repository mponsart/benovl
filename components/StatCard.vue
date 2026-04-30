<template>
  <div class="card p-5">
    <div class="flex items-center justify-between mb-3">
      <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', iconBg]">
        <span class="text-xl">{{ icon }}</span>
      </div>
      <span v-if="trend !== undefined" :class="['text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-600']">
        {{ trend >= 0 ? '+' : '' }}{{ trend }}%
      </span>
    </div>
    <p class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ value }}</p>
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  value: string | number
  iconBg?: string
  trend?: number
}>()
</script>
