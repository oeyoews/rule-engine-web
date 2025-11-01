<script setup lang="ts">
import { ref, provide } from 'vue'
import ActivityBar from './ActivityBar.vue'
import Sidebar from './Sidebar.vue'
import EditorGroup from './EditorGroup.vue'
import Panel from './Panel.vue'
import StatusBar from './StatusBar.vue'
import Resizer from './Resizer.vue'

// 布局状态
const activeView = ref<string>('rules') // 当前活动的侧边栏视图
const sidebarWidth = ref<number>(250) // 侧边栏宽度
const panelHeight = ref<number>(0) // 底部面板高度（0表示隐藏）
const activePanel = ref<string>('') // 当前活动的底部面板

// EditorGroup 引用
const editorGroupRef = ref<InstanceType<typeof EditorGroup> | null>(null)

// 从 localStorage 加载面板大小
const loadPanelSizes = () => {
  const savedSidebarWidth = localStorage.getItem('vscode-sidebar-width')
  if (savedSidebarWidth) {
    sidebarWidth.value = parseInt(savedSidebarWidth, 10)
  }
  const savedPanelHeight = localStorage.getItem('vscode-panel-height')
  if (savedPanelHeight) {
    panelHeight.value = parseInt(savedPanelHeight, 10)
  }
}

// 保存面板大小到 localStorage
const saveSidebarWidth = (width: number) => {
  sidebarWidth.value = width
  localStorage.setItem('vscode-sidebar-width', width.toString())
}

const savePanelHeight = (height: number) => {
  panelHeight.value = height
  if (height > 0) {
    localStorage.setItem('vscode-panel-height', height.toString())
  }
}

// 初始化时加载保存的大小
loadPanelSizes()

// 提供布局状态给子组件
provide('layoutState', {
  activeView,
  sidebarWidth,
  panelHeight,
  activePanel
})

// 提供 EditorGroup 引用给子组件
provide('editorGroupRef', editorGroupRef)

// 切换侧边栏视图
const setActiveView = (view: string) => {
  activeView.value = view
}

// 切换底部面板
const togglePanel = (panel: string) => {
  if (activePanel.value === panel && panelHeight.value > 0) {
    panelHeight.value = 0
    activePanel.value = ''
  } else {
    activePanel.value = panel
    panelHeight.value = panelHeight.value || 200
  }
}

provide('layoutActions', {
  setActiveView,
  togglePanel
})
</script>

<template>
  <div class="vscode-layout h-screen flex flex-col bg-white text-gray-900 overflow-hidden">
    <!-- 主内容区域 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 活动栏 -->
      <ActivityBar />

      <!-- 侧边栏 -->
      <Sidebar />

      <!-- 侧边栏调整大小 -->
      <Resizer
        direction="vertical"
        :min-size="150"
        :max-size="600"
        :default-size="sidebarWidth"
        @resize="saveSidebarWidth"
      />

      <!-- 编辑器组 -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <EditorGroup ref="editorGroupRef" />

        <!-- 底部面板调整大小 -->
        <Resizer
          v-if="panelHeight > 0"
          direction="horizontal"
          :min-size="100"
          :max-size="600"
          :default-size="panelHeight"
          @resize="savePanelHeight"
        />

        <!-- 底部面板 -->
        <Panel v-if="panelHeight > 0" />
      </div>
    </div>

    <!-- 状态栏 -->
    <StatusBar />
  </div>
</template>

<style scoped>
.vscode-layout {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>

