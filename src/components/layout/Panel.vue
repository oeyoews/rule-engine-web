<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { AlertTriangle, Terminal, FileText } from 'lucide-vue-next'
import ProblemsPanel from '../panel/ProblemsPanel.vue'
import OutputPanel from '../panel/OutputPanel.vue'
import TerminalPanel from '../panel/TerminalPanel.vue'

const layoutState = inject<{
  activePanel: any
  panelHeight: any
}>('layoutState')

const panels = [
  { id: 'problems', icon: AlertTriangle, label: '问题', component: ProblemsPanel },
  { id: 'output', icon: FileText, label: '输出', component: OutputPanel },
  { id: 'terminal', icon: Terminal, label: '终端', component: TerminalPanel }
]

const currentPanel = computed(() => {
  return panels.find(p => p.id === layoutState?.activePanel?.value) || panels[0]
})

const CurrentPanelComponent = computed(() => {
  return currentPanel.value?.component || panels[0].component
})
</script>

<template>
  <div
    v-if="layoutState?.panelHeight && layoutState.panelHeight.value > 0"
    class="panel flex flex-col border-t border-gray-700 bg-gray-800"
    :style="{ height: `${layoutState.panelHeight.value}px` }"
  >
    <!-- 面板标签栏 -->
    <div class="panel-tabs flex items-center bg-gray-800 border-b border-gray-700">
      <button
        v-for="panel in panels"
        :key="panel.id"
        :class="[
          'panel-tab flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-gray-700 transition-colors',
          layoutState?.activePanel?.value === panel.id
            ? 'bg-gray-900 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-200'
        ]"
        @click="layoutState.activePanel.value = panel.id"
      >
        <component :is="panel.icon" :size="14" />
        <span class="text-sm">{{ panel.label }}</span>
      </button>
    </div>

    <!-- 面板内容 -->
    <div class="panel-content flex-1 overflow-auto">
      <component :is="CurrentPanelComponent" />
    </div>
  </div>
</template>

<style scoped>
.panel-tabs {
  min-height: 32px;
}

.panel-tab {
  min-width: 100px;
}
</style>

