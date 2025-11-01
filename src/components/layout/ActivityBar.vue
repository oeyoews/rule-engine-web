<script setup lang="ts">
import { ref, inject } from 'vue'
import {
  FolderTree,
  Search,
  ClipboardList,
  Settings,
  Eye,
  HelpCircle
} from 'lucide-vue-next'

const layoutState = inject<{
  activeView: any
}>('layoutState')

const layoutActions = inject<{
  setActiveView: (view: string) => void
}>('layoutActions')

const views = [
  { id: 'explorer', icon: FolderTree, label: '文件浏览器', tooltip: '文件浏览器' },
  { id: 'search', icon: Search, label: '搜索', tooltip: '搜索' },
  { id: 'rules', icon: ClipboardList, label: '规则列表', tooltip: '规则列表' },
  { id: 'config', icon: Settings, label: '配置', tooltip: '全局配置' },
  { id: 'preview', icon: Eye, label: '预览', tooltip: '代码预览' },
  { id: 'help', icon: HelpCircle, label: '帮助', tooltip: '使用帮助' }
]

const handleClick = (viewId: string) => {
  if (layoutActions) {
    layoutActions.setActiveView(viewId)
  }
}
</script>

<template>
  <div class="activity-bar w-12 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-2">
    <button
      v-for="view in views"
      :key="view.id"
      :class="[
        'w-10 h-10 mb-1 flex items-center justify-center rounded transition-colors',
        layoutState?.activeView?.value === view.id
          ? 'bg-gray-700 text-white'
          : 'text-gray-400 hover:bg-gray-750 hover:text-gray-200'
      ]"
      :title="view.tooltip"
      @click="handleClick(view.id)"
    >
      <component :is="view.icon" :size="20" />
    </button>
  </div>
</template>

<style scoped>
.activity-bar {
  min-width: 48px;
}
</style>

