<script setup lang="ts">
import { onMounted } from 'vue'
import VSCodeLayout from './layout/VSCodeLayout.vue'
import { createEditorState } from '@/composables/useEditorState'

// 创建全局状态（通过 provide 注入到子组件）
createEditorState()

// 组件挂载时初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑
})
</script>

<template>
  <VSCodeLayout />
</template>

<style scoped>
</style>
