<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { Settings } from 'lucide-vue-next'

// 获取 EditorGroup 的引用（通过 inject）
const editorGroupRef = inject<Ref<{
  openConfigEditor: () => string
}> | null>('editorGroupRef')

// 打开配置编辑器
const openConfigEditor = () => {
  if (editorGroupRef?.value) {
    editorGroupRef.value.openConfigEditor()
  }
}
</script>

<template>
  <div class="config-view p-4">
    <div class="space-y-4">
      <div class="flex items-center gap-2 mb-4">
        <Settings :size="18" class="text-indigo-600" />
        <h3 class="text-sm font-semibold text-gray-900">全局配置</h3>
      </div>

      <div class="text-gray-600 text-sm mb-4">
        <p class="mb-2">配置全局规则文件的基本信息：</p>
        <ul class="list-disc list-inside space-y-1 text-xs text-gray-500">
          <li>包名 (Package)</li>
          <li>导入类 (Import)</li>
          <li>全局变量 (Global)</li>
          <li>文件描述</li>
        </ul>
      </div>

      <el-button
        type="primary"
        class="w-full"
        @click="openConfigEditor"
      >
        <Settings :size="16" class="mr-2" />
        打开配置编辑器
      </el-button>
    </div>
  </div>
</template>

<style scoped>
</style>
