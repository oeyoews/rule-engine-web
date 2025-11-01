<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { Eye } from 'lucide-vue-next'
import SidebarToolbar from '@/components/common/SidebarToolbar.vue'

// 获取 EditorGroup 的引用（通过 inject）
const editorGroupRef = inject<Ref<{
  openPreviewEditor: () => string
}> | null>('editorGroupRef')

// 打开预览编辑器
const openPreviewEditor = () => {
  if (editorGroupRef?.value) {
    editorGroupRef.value.openPreviewEditor()
  }
}
</script>

<template>
  <div class="preview-view flex flex-col h-full">
    <!-- 工具栏 -->
    <SidebarToolbar :icon="Eye" title="代码预览" />

    <!-- 内容区域 -->
    <div class="flex-1 overflow-auto p-4">
      <div class="space-y-4">

      <div class="text-gray-600 text-sm mb-4">
        <p class="mb-2">预览生成的 DRL 代码：</p>
        <ul class="list-disc list-inside space-y-1 text-xs text-gray-500">
          <li>实时代码预览</li>
          <li>语法高亮显示</li>
          <li>下载 DRL 文件</li>
          <li>复制代码到剪贴板</li>
        </ul>
      </div>

      <el-button
        type="success"
        class="w-full"
        @click="openPreviewEditor"
      >
        <Eye :size="16" class="mr-2" />
        打开代码预览
      </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
