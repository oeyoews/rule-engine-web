<script setup lang="ts">
import { HelpCircle, Info } from 'lucide-vue-next'
import SidebarToolbar from '@/components/common/SidebarToolbar.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { helpItems } from '@/constants/helpItems'
</script>

<template>
  <div class="help-view flex flex-col h-full">
    <!-- 工具栏 -->
    <SidebarToolbar :icon="HelpCircle" title="使用帮助" />

    <!-- 内容区域 -->
    <el-scrollbar class="flex-1">
      <div class="p-4">
        <div class="help-inline">
          <div class="flex flex-col gap-5">
            <!-- 顶部说明 -->
            <div class="pb-3 border-b-2 border-gray-200">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-100 to-blue-200 rounded-xl shrink-0">
                  <Info :size="28" class="text-blue-600" />
                </div>
                <div>
                  <SectionTitle class="mb-1 font-bold! text-gray-800!">DRL 规则编辑器使用指南</SectionTitle>
                  <p class="text-xs text-gray-500">了解各个配置项的含义和用法</p>
                </div>
              </div>
            </div>

            <!-- 帮助项列表 -->
            <div class="grid grid-cols-1 gap-3 pb-3">
              <div
                v-for="(item, index) in helpItems"
                :key="index"
                :class="[
                  'bg-linear-to-br rounded-lg p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg border',
                  item.colors.bg,
                  item.colors.border
                ]"
              >
                <div class="flex items-center gap-2 mb-2">
                  <div :class="['p-1.5 rounded-lg', item.colors.iconBg]">
                    <component :is="item.icon" :size="18" :class="['shrink-0', item.colors.icon]" />
                  </div>
                  <h4 class="text-sm font-semibold text-slate-800 m-0">{{ item.title }}</h4>
                </div>
                <p class="text-xs text-slate-700 mb-2 leading-relaxed">{{ item.description }}</p>
                <div class="bg-white/80 backdrop-blur-sm border border-slate-200 rounded py-1.5 px-2 shadow-sm">
                  <code class="font-mono text-[11px] text-emerald-600 break-all leading-tight">{{ item.example }}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
</style>


