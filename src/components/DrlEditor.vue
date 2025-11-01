<script setup lang="ts">
import { onMounted } from 'vue'
import VSCodeLayout from './layout/VSCodeLayout.vue'
import { useEditorStore } from '@/stores/editorStore'

const editorStore = useEditorStore()

// 组件挂载时初始化
onMounted(() => {
  // 如果没有规则，添加一个默认规则
  if (editorStore.rules.length === 0) {
    editorStore.rules.push({
      name: 'rule_' + Date.now(),
      enabled: true,
      salience: 10,
      noLoop: false,
      lockOnActive: false,
      when: '',
      then: '',
      visualMode: true
    })
    editorStore.activeRules = 0
  }
})
</script>

<template>
  <VSCodeLayout />
</template>

<style scoped>
</style>
