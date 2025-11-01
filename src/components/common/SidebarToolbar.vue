<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="toolbar px-4 h-10 border-b border-gray-300 flex items-center justify-between bg-gray-50">
    <div class="flex items-center gap-2">
      <component :is="icon" :size="16" class="text-gray-600 shrink-0" />
      <h3 class="text-sm font-semibold text-gray-900 leading-none">{{ title }}</h3>
    </div>
    <slot name="actions"></slot>
  </div>
</template>

<style scoped>
</style>


