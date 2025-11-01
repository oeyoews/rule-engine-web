<script setup lang="ts">
import { FolderTree } from 'lucide-vue-next'
import SidebarToolbar from '@/components/common/SidebarToolbar.vue'
// 文件浏览器视图（占位）
</script>

<template>
  <div class="explorer-view flex flex-col h-full">
    <!-- 工具栏 -->
    <SidebarToolbar :icon="FolderTree" title="文件浏览器" />

    <!-- 内容区域 -->
    <div class="flex-1 overflow-auto p-4">
      <div class="text-gray-600 text-sm">
        <p>文件浏览器</p>
        <p class="mt-2 text-xs">当前为单文件编辑器模式</p>
      </div>
    </div>
  </div>
</template>

