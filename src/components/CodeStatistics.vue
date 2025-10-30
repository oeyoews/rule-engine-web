<script setup lang="ts">
import { Hash, FileCode, ToggleRight } from 'lucide-vue-next'

// Props
defineProps<{
  rulesCount: number
  codeLines: number
  enabledRulesCount: number
}>()
</script>

<template>
  <div class="flex items-center justify-between text-sm p-3 bg-linear-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
        <Hash :size="16" class="text-blue-600" />
        <span class="text-gray-600">规则数量:</span>
        <span class="font-bold text-blue-600">{{ rulesCount }}</span>
      </div>
      <div class="flex items-center gap-2">
        <FileCode :size="16" class="text-green-600" />
        <span class="text-gray-600">代码行数:</span>
        <span class="font-bold text-green-600">{{ codeLines }}</span>
      </div>
      <div class="flex items-center gap-2">
        <ToggleRight :size="16" class="text-purple-600" />
        <span class="text-gray-600">启用规则:</span>
        <span class="font-bold text-purple-600">{{ enabledRulesCount }}</span>
      </div>
    </div>
  </div>
</template>

