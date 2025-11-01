<script setup lang="ts">
import { computed, inject } from 'vue'
import ExplorerView from '../sidebar/ExplorerView.vue'
import SearchView from '../sidebar/SearchView.vue'
import RulesListView from '../sidebar/RulesListView.vue'
import ConfigView from '../sidebar/ConfigView.vue'
import PreviewView from '../sidebar/PreviewView.vue'

const layoutState = inject<{
  activeView: any
  sidebarWidth: any
}>('layoutState')

const currentView = computed(() => layoutState?.activeView?.value || 'rules')

const views: Record<string, any> = {
  explorer: ExplorerView,
  search: SearchView,
  rules: RulesListView,
  config: ConfigView,
  preview: PreviewView
}

const CurrentViewComponent = computed(() => {
  return views[currentView.value] || views.rules
})
</script>

<template>
  <div
    class="sidebar bg-gray-50 border-r border-gray-300 overflow-hidden flex flex-col"
    :style="{ width: `${layoutState?.sidebarWidth?.value || 250}px` }"
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

