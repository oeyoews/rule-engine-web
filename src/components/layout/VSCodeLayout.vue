<script setup lang="ts">
import { ref, watch } from 'vue'
import ActivityBar from './ActivityBar.vue'
import Sidebar from './Sidebar.vue'
import EditorGroup from './EditorGroup.vue'
import StatusBar from './StatusBar.vue'
import Resizer from './Resizer.vue'
import Panel from './Panel.vue'
import { useLayoutStore } from '@/stores/layoutStore'

const layoutStore = useLayoutStore()

// EditorGroup 引用
const editorGroupRef = ref<InstanceType<typeof EditorGroup> | null>(null)

// 保存面板大小到 localStorage
const saveSidebarWidth = (width: number) => {
  layoutStore.saveSidebarWidth(width)
}

const savePanelHeight = (height: number) => {
  layoutStore.savePanelHeight(height)
}

// 监听 editorGroupRef 的变化并更新到 store
watch(editorGroupRef, (newRef) => {
  layoutStore.editorGroupRef = newRef
}, { immediate: true })
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
        :default-size="layoutStore.sidebarWidth"
        @resize="saveSidebarWidth"
      />

      <!-- 编辑器组 -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <EditorGroup ref="editorGroupRef" />

        <!-- 底部面板调整大小 -->
        <!-- <Resizer
          v-if="layoutStore.panelHeight > 0"
          direction="horizontal"
          :min-size="100"
          :max-size="600"
          :default-size="layoutStore.panelHeight"
          @resize="savePanelHeight"
        /> -->

        <!-- 底部面板 -->
        <!-- <Panel v-if="layoutStore.panelHeight > 0" /> -->
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

