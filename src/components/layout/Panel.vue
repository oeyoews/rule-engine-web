<!-- 底部状态栏 -->
<script setup lang="ts">
import { computed, h } from 'vue'
import { AlertTriangle, Terminal, FileText } from 'lucide-vue-next'
import { MenuBar } from '@imengyu/vue3-context-menu'
import ProblemsPanel from '@/components/panel/ProblemsPanel.vue'
import OutputPanel from '@/components/panel/OutputPanel.vue'
import TerminalPanel from '@/components/panel/TerminalPanel.vue'
import { useLayoutStore } from '@/stores/layoutStore'

const layoutStore = useLayoutStore()

const panels = [
  { id: 'problems', icon: AlertTriangle, label: '问题', component: ProblemsPanel },
  { id: 'output', icon: FileText, label: '输出', component: OutputPanel },
  { id: 'terminal', icon: Terminal, label: '终端', component: TerminalPanel }
]

const currentPanel = computed(() => {
  return panels.find(p => p.id === layoutStore.activePanel) || panels[0]
})

const CurrentPanelComponent = computed(() => {
  return currentPanel.value?.component || panels[0].component
})

// MenuBar 选项
const menuBarOptions = computed(() => {
  return {
    items: panels.map(panel => ({
      label: panel.label,
      icon: () => h(panel.icon, { size: 14 }),
      checked: layoutStore.activePanel === panel.id,
      onClick: () => {
        layoutStore.activePanel = panel.id
        if (layoutStore.panelHeight === 0) {
          layoutStore.panelHeight = 200
        }
      }
    }))
  }
})
</script>

<template>
  <div
    v-if="layoutStore.panelHeight > 0"
    class="panel flex flex-col border-t border-gray-300 bg-gray-50"
    :style="{ height: `${layoutStore.panelHeight}px` }"
  >
    <!-- 面板标签栏 -->
    <div class="panel-tabs bg-gray-100 border-b border-gray-300">
      <MenuBar :options="menuBarOptions" />
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

/* MenuBar 样式覆盖，使其看起来像标签页 */
:deep(.mx-menu-bar) {
  background: transparent !important;
  border: none !important;
}

:deep(.mx-menu-bar-item) {
  padding: 6px 12px !important;
  border-right: 1px solid #d1d5db !important;
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  min-width: 100px;
}

:deep(.mx-menu-bar-item:hover) {
  background: #e5e7eb !important;
  color: #111827 !important;
}

:deep(.mx-menu-bar-item.mx-menu-bar-item-checked) {
  background: #ffffff !important;
  color: #111827 !important;
}
</style>

