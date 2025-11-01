<script setup lang="ts">
import { FolderTree } from 'lucide-vue-next'
// 文件浏览器视图（占位）
</script>

<template>
  <div class="explorer-view flex flex-col h-full">
    <!-- 工具栏 -->
    <div class="toolbar px-4 py-2.5 border-b border-gray-300 flex items-center justify-between bg-gray-50">
      <div class="flex items-center gap-2">
        <FolderTree :size="16" class="text-gray-600" />
        <h3 class="text-sm font-semibold text-gray-900">文件浏览器</h3>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 overflow-auto p-4">
      <div class="text-gray-600 text-sm">
        <p>文件浏览器</p>
        <p class="mt-2 text-xs">当前为单文件编辑器模式</p>
      </div>
    </div>
  </div>
</template>

