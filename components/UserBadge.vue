<template>
  <span :class="badgeClass">{{ label }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{ role?: string; status?: string }>()

const badgeClass = computed(() => {
  if (props.role) {
    return { admin: 'badge badge-purple', responsable: 'badge badge-blue', benevole: 'badge badge-green' }[props.role] ?? 'badge'
  }
  if (props.status) {
    return { actif: 'badge badge-green', suspendu: 'badge badge-red' }[props.status] ?? 'badge'
  }
  return 'badge'
})

const label = computed(() => props.role ?? props.status ?? '')
</script>
