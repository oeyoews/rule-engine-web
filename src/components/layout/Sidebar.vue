<script setup lang="ts">
import { computed } from 'vue'
import ExplorerView from '@/components/sidebar/ExplorerView.vue'
import SearchView from '@/components/sidebar/SearchView.vue'
import RulesListView from '@/components/sidebar/RulesListView.vue'
import ConfigView from '@/components/sidebar/ConfigView.vue'
import PreviewView from '@/components/sidebar/PreviewView.vue'
import HelpView from '@/components/sidebar/HelpView.vue'
import { useLayoutStore } from '@/stores/layoutStore'

const layoutStore = useLayoutStore()

const currentView = computed(() => layoutStore.activeView || 'rules')

const views: Record<string, any> = {
  explorer: ExplorerView,
  search: SearchView,
  rules: RulesListView,
  config: ConfigView,
  preview: PreviewView,
  help: HelpView
}

const CurrentViewComponent = computed(() => {
  return views[currentView.value] || views.rules
})
</script>

<template>
  <div
    class="sidebar bg-gray-50 border-r border-gray-300 overflow-hidden flex flex-col"
    :style="{ width: `${layoutStore.sidebarWidth || 250}px` }"
  >
    <div class="flex-1 overflow-auto">
      <component :is="CurrentViewComponent" />
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  min-width: 200px;
  max-width: 600px;
}
</style>

