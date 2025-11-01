<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { Eye } from 'lucide-vue-next'

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
  <div class="preview-view p-4">
    <div class="space-y-4">
      <div class="flex items-center gap-2 mb-4">
        <Eye :size="18" class="text-emerald-600" />
        <h3 class="text-sm font-semibold text-gray-900">代码预览</h3>
      </div>

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
</template>

<style scoped>
</style>
