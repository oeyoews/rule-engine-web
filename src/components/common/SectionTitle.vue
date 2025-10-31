<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <h2 class="text-lg font-semibold text-gray-700 mb-3">
    <slot>{{ title }}</slot>
  </h2>
</template>

