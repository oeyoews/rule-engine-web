<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'

const searchQuery = ref('')
const searchResults = ref<any[]>([])

const handleSearch = () => {
  // TODO: 实现搜索功能
  console.log('搜索:', searchQuery.value)
}
</script>

<template>
  <div class="search-view p-4">
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <Search :size="16" class="text-gray-400" />
        <span class="text-sm font-medium text-gray-300">搜索</span>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索代码..."
        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        @keyup.enter="handleSearch"
      />
    </div>

    <div v-if="searchResults.length === 0" class="text-gray-500 text-xs text-center py-8">
      暂无搜索结果
    </div>
  </div>
</template>

