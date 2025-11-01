<script setup lang="ts">
interface Props {
  data?: {
    index?: number
  }
}

const props = defineProps<Props>()
</script>

<template>
  <div class="rule-editor p-4">
    <div class="text-gray-400 text-center py-8">
      <p>规则编辑器</p>
      <p class="mt-2 text-xs">规则 {{ props.data?.index !== undefined ? props.data.index + 1 : '' }} 编辑器功能将在后续实现</p>
    </div>
  </div>
</template>

