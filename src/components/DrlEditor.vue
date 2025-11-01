<script setup lang="ts">
import { onMounted } from 'vue'
import VSCodeLayout from './layout/VSCodeLayout.vue'
import { createEditorState } from '@/composables/useEditorState'

// 创建全局状态（通过 provide 注入到子组件）
const editorState = createEditorState()

// 组件挂载时初始化
onMounted(() => {
  // 如果没有规则，添加一个默认规则
  if (editorState.rules.value.length === 0) {
    editorState.rules.value.push({
      name: 'rule_' + Date.now(),
      enabled: true,
      salience: 10,
      noLoop: false,
      lockOnActive: false,
      when: '',
      then: '',
      visualMode: true
    })
    editorState.activeRules.value = 0
  }
})
</script>

<template>
  <VSCodeLayout />
</template>

<style scoped>
</style>
