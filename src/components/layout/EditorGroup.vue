<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { X, XCircle, XSquare } from 'lucide-vue-next'
import ContextMenu from '@imengyu/vue3-context-menu'
import ConfigEditor from '@/components/editor/ConfigEditor.vue'
import RuleEditor from '@/components/editor/RuleEditor.vue'
import AdvancedEditor from '@/components/editor/AdvancedEditor.vue'
import PreviewEditor from '@/components/editor/PreviewEditor.vue'
import { useEditorStore } from '@/stores/editorStore'
import { getIcon } from '@/utils/tabIcon'

// 使用 markRaw 标记组件，避免被响应式处理
const ConfigEditorRaw = markRaw(ConfigEditor)
const RuleEditorRaw = markRaw(RuleEditor)
const AdvancedEditorRaw = markRaw(AdvancedEditor)
const PreviewEditorRaw = markRaw(PreviewEditor)

const editorStore = useEditorStore()

const tabs = ref<EditorTab[]>([])
const activeTabId = ref<string>('')

// 添加标签页
const addTab = (tab: Omit<EditorTab, 'id'>) => {
  const id = `${tab.type}-${Date.now()}`
  const newTab: EditorTab = {
    ...tab,
    id,
    modified: false
  }
  tabs.value.push(newTab)
  activeTabId.value = id
  return id
}

// 关闭标签页
const closeTab = async (id: string) => {
  const tab = tabs.value.find(t => t.id === id)

  if (tab?.type === 'advanced') {
    // 提示用户已离开高级模式
    ElMessage.info('您已离开高级模式。高级模式中的修改不会被保存，表单内容将保持不变。')
    // 关闭高级模式状态
    editorStore.advancedMode = false
  }

  removeTab(id)
}

// 内部函数：直接移除标签页（不显示确认对话框）
const removeTab = (id: string) => {
  const index = tabs.value.findIndex(tab => tab.id === id)
  if (index !== -1) {
    tabs.value.splice(index, 1)
    // 如果关闭的是当前标签页，切换到上一个或下一个
    if (activeTabId.value === id) {
      if (tabs.value.length > 0) {
        activeTabId.value = tabs.value[Math.min(index, tabs.value.length - 1)]?.id || ''
      } else {
        activeTabId.value = ''
      }
    }
  }
}

// 切换标签页
const switchTab = async (id: string) => {
  const tab = tabs.value.find(t => t.id === id)

  // 如果从高级模式切换，提示用户
  const currentTab = tabs.value.find(t => t.id === activeTabId.value)
  if (currentTab?.type === 'advanced' && tab?.type !== 'advanced') {
    // 提示用户已离开高级模式
    ElMessage.info('您已离开高级模式。高级模式中的修改不会被保存，表单内容将保持不变。')
    // 关闭高级模式状态
    editorStore.advancedMode = false
  }

  activeTabId.value = id
}

// 当前活动标签页
const activeTab = computed(() => {
  return tabs.value.find(tab => tab.id === activeTabId.value)
})

// 处理标签页切换
const handleTabChange = async (tabId: string | number) => {
  await switchTab(String(tabId))
}

// 处理标签页关闭
const handleTabRemove = async (tabId: string | number) => {
  await closeTab(String(tabId))
}

// 处理标签页栏右键菜单
const handleTabsBarContextMenu = (event: MouseEvent, tabId: string) => {
  event.preventDefault()
  event.stopPropagation()

  const tab = tabs.value.find(t => t.id === tabId)
  if (!tab) return

  // const index = tabs.value.findIndex(t => t.id === tabId)
  const hasMultipleTabs = tabs.value.length > 1

  ContextMenu.showContextMenu({
    x: event.clientX,
    y: event.clientY,
    items: [
      {
        label: '关闭',
        icon: () => h(X, { size: 14 }),
        disabled: !hasMultipleTabs,
        onClick: async () => {
          await closeTab(tab.id)
        }
      },
      {
        label: '关闭其他',
        icon: () => h(XCircle, { size: 14 }),
        disabled: !hasMultipleTabs,
        onClick: async () => {
          const tabsToClose = tabs.value.filter(t => t.id !== tab.id)
          for (const t of tabsToClose) {
            await closeTab(t.id)
          }
        }
      },
      {
        label: '关闭所有',
        icon: () => h(XSquare, { size: 14 }),
        disabled: !hasMultipleTabs,
        onClick: async () => {
          const tabsToClose = [...tabs.value]
          for (const t of tabsToClose) {
            await closeTab(t.id)
          }
        },
        divided: true
      },
    ]
  })
}

// 提供编辑器操作方法
const openConfigEditor = () => {
  const existingTab = tabs.value.find(tab => tab.type === 'config')
  if (existingTab) {
    activeTabId.value = existingTab.id
    return existingTab.id
  }
  return addTab({
    type: 'config',
    title: '全局配置',
    component: ConfigEditorRaw
  })
}

const openRuleEditor = (ruleIndex: number) => {
  const rule = editorStore.rules[ruleIndex]
  if (!rule) return ''

  const ruleName = rule.name
  // 使用 ruleName 查找已存在的标签页
  const existingTab = tabs.value.find(tab =>
    tab.type === 'rule' && tab.data?.ruleName === ruleName
  )

  if (existingTab) {
    activeTabId.value = existingTab.id
    // 更新标题为最新的规则名称
    existingTab.title = ruleName || `规则 ${ruleIndex + 1}`
    return existingTab.id
  }

  const title = ruleName || `规则 ${ruleIndex + 1}`
  return addTab({
    type: 'rule',
    title,
    component: RuleEditorRaw,
    data: { ruleName: ruleName, index: ruleIndex } // 同时保存 ruleName 和 index 以保持兼容性
  })
}

// 监听规则名称变化，更新对应的标签页标题和 ruleName
watch(
  () => editorStore.rules.map((r, idx) => ({ name: r.name, index: idx })),
  () => {
    tabs.value.forEach(tab => {
      if (tab.type === 'rule' && tab.data?.ruleName) {
        const oldRuleName = tab.data.ruleName
        // 尝试找到新的规则名称（可能被重命名了）
        let foundRule = editorStore.rules.find(r => r.name === oldRuleName)

        // 如果找不到，可能是规则被重命名了，尝试通过索引匹配
        if (!foundRule && tab.data?.index !== undefined) {
          const oldIndex = tab.data.index
          if (oldIndex >= 0 && oldIndex < editorStore.rules.length) {
            foundRule = editorStore.rules[oldIndex]
            // 更新标签页的 ruleName
            if (tab.data && foundRule) {
              tab.data.ruleName = foundRule.name
            }
          }
        }

        if (foundRule) {
          tab.title = foundRule.name || `规则 ${editorStore.rules.findIndex(r => r.name === foundRule!.name) + 1}`
          // 更新索引以保持同步
          if (tab.data) {
            tab.data.index = editorStore.rules.findIndex(r => r.name === foundRule!.name)
          }
        }
      }
    })
  },
  { deep: true }
)

// 监听规则数组变化，如果规则被删除，关闭对应的标签页
watch(
  () => editorStore.rules.length,
  (newLength, oldLength) => {
    if (newLength < oldLength) {
      // 规则被删除了，检查是否有标签页指向已删除的规则
      const existingRuleNames = new Set(editorStore.rules.map(r => r.name))
      tabs.value.forEach(tab => {
        if (tab.type === 'rule' && tab.data?.ruleName) {
          if (!existingRuleNames.has(tab.data.ruleName)) {
            // 规则已被删除，直接关闭标签页（不显示确认对话框）
            removeTab(tab.id)
          }
        }
      })
    }
  }
)

const openAdvancedEditor = () => {
  const existingTab = tabs.value.find(tab => tab.type === 'advanced')
  if (existingTab) {
    activeTabId.value = existingTab.id
    return existingTab.id
  }
  // 设置高级模式状态
  editorStore.advancedMode = true
  editorStore.manualDrlCode = editorStore.autoGeneratedCode
  return addTab({
    type: 'advanced',
    title: '高级模式',
    component: AdvancedEditorRaw
  })
}

const openPreviewEditor = () => {
  const existingTab = tabs.value.find(tab => tab.type === 'preview')
  if (existingTab) {
    activeTabId.value = existingTab.id
    return existingTab.id
  }
  return addTab({
    type: 'preview',
    title: '代码预览',
    component: PreviewEditorRaw
  })
}

// 暴露方法给父组件
defineExpose({
  openConfigEditor,
  openRuleEditor,
  openAdvancedEditor,
  openPreviewEditor,
  closeTab
})
</script>

<template>
  <div class="editor-group flex flex-col flex-1 overflow-hidden bg-white">
    <!-- 标签页栏 -->
    <div v-if="tabs.length > 0" class="tabs-bar">
      <el-tabs
        v-model="activeTabId"
        type="card"
        @tab-change="handleTabChange"
        @tab-remove="handleTabRemove"
      >
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.id"
          :name="tab.id"
          :label="tab.title"
        >
          <template #label>
            <span
              class="tab-label flex items-center gap-2"
              @contextmenu.prevent="handleTabsBarContextMenu($event, tab.id)"
            >
              <component :is="getIcon(tab.type)" :size="14" class="shrink-0" />
              <span class="tab-title truncate">{{ tab.title }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 编辑器内容区域 -->
    <div class="editor-content flex-1 overflow-auto">
      <component
        v-if="activeTab"
        :is="activeTab.component"
        :key="activeTab.id"
        :data="activeTab.data"
      />
      <div v-else class="h-full flex items-center justify-center text-gray-500">
        <div class="text-center">
          <p class="text-lg mb-2">欢迎使用 DRL 编辑器</p>
          <p class="text-sm">从侧边栏选择功能开始编辑</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-bar {
  min-height: 36px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.tab-label {
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

/* Element Plus Tabs 样式覆盖 */
:deep(.el-tabs__header) {
  margin: 0;
  border-bottom: none;
}

:deep(.el-tabs__nav-wrap) {
  background: #f9fafb;
  padding: 0;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__nav) {
  border: none;
}

:deep(.el-tabs__item) {
  padding: 10px 20px !important;
  height: 36px;
  line-height: 16px;
  border: none !important;
  border-right: 1px solid #e5e7eb !important;
  border-top: 2px solid transparent !important;
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  min-width: 120px;
  max-width: 300px;
  transition: all 0.2s ease !important;
  position: relative;
  margin-right: 0 !important;
  overflow: hidden;
}

:deep(.el-tabs__item > span) {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

:deep(.el-tabs__item:hover) {
  background: #e5e7eb !important;
  color: #111827 !important;
}

:deep(.el-tabs__item.is-active::before) {
  display: none;
}

/* 第一个标签页的上边框 */
:deep(.el-tabs__item:first-child) {
  border-left: none !important;
}

/* 最后一个标签页的右边框 */
:deep(.el-tabs__item:last-child) {
  border-right: none !important;
}


:deep(.el-tabs__item .el-icon-close) {
  width: 14px;
  height: 14px;
  margin-left: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

:deep(.el-tabs__item .el-icon-close:hover) {
  background-color: rgba(0, 0, 0, 0.1);
}

.editor-content {
  background: #ffffff;
}
</style>

