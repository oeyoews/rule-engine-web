<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'
import SidebarToolbar from '@/components/common/SidebarToolbar.vue'

const searchQuery = ref('')
const searchResults = ref<any[]>([])

const handleSearch = () => {
  // TODO: 实现搜索功能
  console.log('搜索:', searchQuery.value)
}
</script>

<template>
  <div class="search-view flex flex-col h-full">
    <!-- 工具栏 -->
    <SidebarToolbar :icon="Search" title="搜索" />

    <!-- 内容区域 -->
    <div class="flex-1 overflow-auto p-4">
      <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索代码..."
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
        @keyup.enter="handleSearch"
      />
    </div>

      <div v-if="searchResults.length === 0" class="text-gray-500 text-xs text-center py-8">
        暂无搜索结果
      </div>
    </div>
  </div>
</template>

