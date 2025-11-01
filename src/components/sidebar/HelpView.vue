<script setup lang="ts">
import { HelpCircle, Info } from 'lucide-vue-next'
import SidebarToolbar from '@/components/common/SidebarToolbar.vue'
import HelpDialog from '@/components/HelpDialog.vue'
</script>

<template>
  <div class="help-view flex flex-col h-full">
    <!-- 工具栏 -->
    <SidebarToolbar :icon="HelpCircle" title="使用帮助" />

    <!-- 内容区域 -->
    <el-scrollbar class="flex-1">
      <div class="p-4">
        <HelpDialog />
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
</style>

