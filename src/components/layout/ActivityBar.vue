<script setup lang="ts">
import { inject, ref } from 'vue'
import {
  FolderTree,
  Search,
  ClipboardList,
  Settings,
  Eye,
  HelpCircle
} from 'lucide-vue-next'
import HelpDialog from '../HelpDialog.vue'

const layoutState = inject<{
  activeView: any
}>('layoutState')

const layoutActions = inject<{
  setActiveView: (view: string) => void
}>('layoutActions')

const showHelpDialog = ref(false)

const views = [
  { id: 'explorer', icon: FolderTree, label: '文件浏览器', tooltip: '文件浏览器' },
  { id: 'search', icon: Search, label: '搜索', tooltip: '搜索' },
  { id: 'rules', icon: ClipboardList, label: '规则列表', tooltip: '规则列表' },
  { id: 'config', icon: Settings, label: '配置', tooltip: '全局配置' },
  { id: 'preview', icon: Eye, label: '预览', tooltip: '代码预览' },
  { id: 'help', icon: HelpCircle, label: '帮助', tooltip: '使用帮助' }
]

const handleClick = (viewId: string) => {
  if (viewId === 'help') {
    showHelpDialog.value = true
  } else if (layoutActions) {
    layoutActions.setActiveView(viewId)
  }
}
</script>

<template>
  <div class="activity-bar w-12 bg-gray-100 border-r border-gray-300 flex flex-col items-center py-2">
    <el-button
      v-for="view in views"
      :key="view.id"
      :class="[
        'w-10 h-10 mb-1 flex items-center justify-center rounded transition-colors border-0',
        layoutState?.activeView?.value === view.id
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      ]"
      :title="view.tooltip"
      text
      @click="handleClick(view.id)"
    >
      <component :is="view.icon" :size="20" />
    </el-button>
  </div>

  <!-- 帮助对话框 -->
  <el-dialog
    v-model="showHelpDialog"
    title="使用帮助"
    width="80%"
    :close-on-click-modal="false"
  >
    <HelpDialog />
  </el-dialog>
</template>

<style scoped>
.activity-bar {
  min-width: 48px;
}
</style>

