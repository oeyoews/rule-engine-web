<script setup lang="ts">
import { ref, computed } from 'vue'
import ConfigEditor from '../editor/ConfigEditor.vue'
import RuleEditor from '../editor/RuleEditor.vue'
import AdvancedEditor from '../editor/AdvancedEditor.vue'
import PreviewEditor from '../editor/PreviewEditor.vue'

// 编辑器标签页类型
interface EditorTab {
  id: string
  type: 'config' | 'rule' | 'advanced' | 'preview'
  title: string
  component: any
  data?: any
  modified?: boolean
}

const tabs = ref<EditorTab[]>([])
const activeTabId = ref<string>('')

// 添加标签页
const addTab = (tab: Omit<EditorTab, 'id'>) => {
  const id = `${tab.type}-${Date.now()}`
  const newTab: EditorTab = {
    ...tab,
    id,
    modified: false
  }
  tabs.value.push(newTab)
  activeTabId.value = id
  return id
}

// 关闭标签页
const closeTab = (id: string) => {
  const index = tabs.value.findIndex(tab => tab.id === id)
  if (index !== -1) {
    tabs.value.splice(index, 1)
    // 如果关闭的是当前标签页，切换到上一个或下一个
    if (activeTabId.value === id) {
      if (tabs.value.length > 0) {
        activeTabId.value = tabs.value[Math.min(index, tabs.value.length - 1)]?.id || ''
      } else {
        activeTabId.value = ''
      }
    }
  }
}

// 当前活动标签页
const activeTab = computed(() => {
  return tabs.value.find(tab => tab.id === activeTabId.value)
})

// 提供编辑器操作方法
const openConfigEditor = () => {
  const existingTab = tabs.value.find(tab => tab.type === 'config')
  if (existingTab) {
    activeTabId.value = existingTab.id
    return existingTab.id
  }
  return addTab({
    type: 'config',
    title: '全局配置',
    component: ConfigEditor
  })
}

const openRuleEditor = (ruleIndex: number) => {
  const existingTab = tabs.value.find(tab => tab.type === 'rule' && tab.data?.index === ruleIndex)
  if (existingTab) {
    activeTabId.value = existingTab.id
    return existingTab.id
  }
  return addTab({
    type: 'rule',
    title: `规则 ${ruleIndex + 1}`,
    component: RuleEditor,
    data: { index: ruleIndex }
  })
}

const openAdvancedEditor = () => {
  const existingTab = tabs.value.find(tab => tab.type === 'advanced')
  if (existingTab) {
    activeTabId.value = existingTab.id
    return existingTab.id
  }
  return addTab({
    type: 'advanced',
    title: '高级模式',
    component: AdvancedEditor
  })
}

const openPreviewEditor = () => {
  const existingTab = tabs.value.find(tab => tab.type === 'preview')
  if (existingTab) {
    activeTabId.value = existingTab.id
    return existingTab.id
  }
  return addTab({
    type: 'preview',
    title: '代码预览',
    component: PreviewEditor
  })
}

// 暴露方法给父组件
defineExpose({
  openConfigEditor,
  openRuleEditor,
  openAdvancedEditor,
  openPreviewEditor,
  closeTab
})
</script>

<template>
  <div class="editor-group flex flex-col flex-1 overflow-hidden bg-gray-900">
    <!-- 标签页栏 -->
    <div v-if="tabs.length > 0" class="tabs-bar flex items-center bg-gray-800 border-b border-gray-700 overflow-x-auto">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'tab-item flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-gray-700 transition-colors',
          activeTabId === tab.id
            ? 'bg-gray-900 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-200'
        ]"
        @click="activeTabId = tab.id"
      >
        <span class="text-sm">{{ tab.title }}</span>
        <button
          v-if="tabs.length > 1"
          class="ml-2 w-4 h-4 flex items-center justify-center hover:bg-gray-600 rounded"
          @click.stop="closeTab(tab.id)"
        >
          <span class="text-xs">×</span>
        </button>
      </div>
    </div>

    <!-- 编辑器内容区域 -->
    <div class="editor-content flex-1 overflow-auto">
      <component
        v-if="activeTab"
        :is="activeTab.component"
        :key="activeTab.id"
        :data="activeTab.data"
      />
      <div v-else class="h-full flex items-center justify-center text-gray-500">
        <div class="text-center">
          <p class="text-lg mb-2">欢迎使用 DRL 编辑器</p>
          <p class="text-sm">从侧边栏选择功能开始编辑</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-bar {
  min-height: 36px;
}

.tab-item {
  min-width: 120px;
  max-width: 300px;
}

.editor-content {
  background: #1e1e1e;
}
</style>

