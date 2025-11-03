<script setup lang="ts">
import { h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Trash2, Grip, CheckCircle, XCircle, Zap, FileText, ClipboardList, Pencil, Power, PowerOff } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editorStore'
import { useLayoutStore } from '@/stores/layoutStore'
import { VueDraggable } from 'vue-draggable-plus'
import ContextMenu from '@imengyu/vue3-context-menu'
import SidebarToolbar from '@/components/common/SidebarToolbar.vue'

const editorStore = useEditorStore()
const layoutStore = useLayoutStore()

// 打开规则编辑器
const openRuleEditor = (index: number) => {
  if (layoutStore.editorGroupRef) {
    layoutStore.editorGroupRef.openRuleEditor(index)
  }
}

// 添加规则
const addRule = () => {
  editorStore.rules.push({
    name: 'rule_' + Date.now(),
    enabled: true,
    salience: 0,
    noLoop: false,
    lockOnActive: false,
    when: '',
    then: '',
    visualMode: true
  })
  // 自动展开新添加的规则
  editorStore.activeRules = editorStore.rules.length - 1

  // 打开规则编辑器
  openRuleEditor(editorStore.rules.length - 1)

  ElMessage.success('规则已添加')
}

// 确认删除规则
const confirmRemoveRule = (index: number) => {
  const rule = editorStore.rules[index]
  if (!rule) return

  const ruleName = rule.name || `规则 ${index + 1}`
  ElMessageBox.confirm(
    `确定要删除规则"${ruleName}"吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    removeRule(index)
    ElMessage.success('规则已删除')
  }).catch(() => {
    // 用户取消删除
  })
}

// 删除规则
const removeRule = (index: number) => {
  editorStore.rules.splice(index, 1)
  // 删除规则后调整 activeRules
  if (typeof editorStore.activeRules === 'number' &&
      editorStore.activeRules >= editorStore.rules.length &&
      editorStore.rules.length > 0) {
    editorStore.activeRules = editorStore.rules.length - 1
  } else if (editorStore.rules.length === 0) {
    editorStore.activeRules = -1
  }
}

// 重命名规则
const renameRule = (index: number) => {
  const rule = editorStore.rules[index]
  if (!rule) return

  const currentName = rule.name || `规则 ${index + 1}`

  ElMessageBox.prompt(
    '请输入新的规则名称',
    '重命名规则',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: currentName,
      inputPattern: /^.{1,50}$/,
      inputErrorMessage: '规则名称长度应在1-50个字符之间'
    }
  ).then(({ value }) => {
    if (value && value.trim()) {
      rule.name = value.trim()
      ElMessage.success('规则已重命名')
    } else {
      ElMessage.warning('规则名称不能为空')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 切换规则的启用/禁用状态
const toggleRuleEnabled = (index: number) => {
  const rule = editorStore.rules[index]
  if (!rule) return

  rule.enabled = !rule.enabled
  const status = rule.enabled ? '启用' : '禁用'
  ElMessage.success(`规则已${status}`)
}

// 处理右键菜单
const handleContextMenu = (event: MouseEvent, index: number) => {
  event.preventDefault()
  event.stopPropagation()

  const rule = editorStore.rules[index]
  if (!rule) return

  ContextMenu.showContextMenu({
    x: event.clientX,
    y: event.clientY,
    items: [
      {
        label: rule.enabled ? '禁用规则' : '启用规则',
        icon: () => h(rule.enabled ? PowerOff : Power, {
          size: 14,
          class: rule.enabled ? 'context-menu-icon-disable' : 'context-menu-icon-enable'
        }),
        onClick: () => {
          toggleRuleEnabled(index)
        },
        divided: true
      },
      {
        label: '重命名',
        icon: () => h(Pencil, { size: 14, class: 'context-menu-icon-rename' }),
        onClick: () => {
          renameRule(index)
        }
      },
      {
        label: '删除',
        icon: () => h(Trash2, { size: 14, class: 'context-menu-icon-delete' }),
        onClick: () => {
          confirmRemoveRule(index)
        }
      }
    ]
  })
}
</script>

<template>
  <div class="rules-list-view flex flex-col h-full">
    <!-- 工具栏 -->
    <SidebarToolbar :icon="ClipboardList" title="规则列表">
      <template #actions>
        <el-button
          type="primary"
          size="small"
          @click="addRule"
        >
          <Plus :size="14" class="mr-1" />
          添加规则
        </el-button>
      </template>
    </SidebarToolbar>

    <!-- 规则列表 -->
    <el-scrollbar class="rules-list flex-1">
      <div class="px-2 py-2 pr-4">
        <!-- 空状态 -->
        <div v-if="editorStore.rules.length === 0" class="text-center py-12">
          <div class="flex flex-col items-center gap-3">
            <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <FileText :size="40" class="text-gray-400" />
            </div>
            <p class="text-gray-500 text-sm">暂无规则</p>
            <el-button
              type="primary"
              @click="addRule"
            >
              添加第一个规则
            </el-button>
          </div>
        </div>

        <!-- 规则项目 -->
        <VueDraggable
          v-model="editorStore.rules"
          :animation="200"
          handle=".rule-drag-handle"
          ghostClass="rule-dragging-ghost"
        >
          <div
            v-for="(rule, index) in editorStore.rules"
            :key="index"
            class="rule-item bg-white hover:bg-gray-50 border border-gray-200 rounded p-3 mb-2 cursor-pointer transition-colors shadow-sm"
            @click="openRuleEditor(index)"
            @contextmenu.prevent="handleContextMenu($event, index)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <!-- 拖拽手柄 -->
                <div class="rule-drag-handle flex items-center justify-center size-6 cursor-move hover:bg-gray-200 rounded transition-colors">
                  <Grip :size="14" class="text-gray-500" />
                </div>

                <!-- 规则编号 -->
                <div class="flex items-center justify-center size-6 bg-indigo-600 rounded-full text-white font-bold text-xs shrink-0">
                  {{ index + 1 }}
                </div>

                <!-- 规则信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-gray-900 text-sm truncate">
                      {{ rule.name || '规则 ' + (index + 1) }}
                    </span>
                    <el-tag v-if="rule.salience > 0" size="small" class="bg-violet-600 text-white border-none">
                      <span class="inline-flex items-center gap-1">
                        <Zap :size="12" />
                        {{ rule.salience }}
                      </span>
                    </el-tag>
                    <el-tag
                      size="small"
                      :class="rule.enabled ? 'bg-emerald-600 text-white border-none' : 'bg-gray-400 text-white border-none'"
                    >
                      <span class="inline-flex items-center gap-1">
                        <CheckCircle v-if="rule.enabled" :size="12" />
                        <XCircle v-else :size="12" />
                        {{ rule.enabled ? '启用' : '禁用' }}
                      </span>
                    </el-tag>
                  </div>
                  <div class="text-xs text-gray-500 truncate">
                    {{ rule.description || '暂无描述' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </VueDraggable>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.rule-dragging-ghost {
  opacity: 0.5;
  background: #e5e7eb;
  border: 2px dashed #818cf8;
}
</style>

<style lang="css">
/* 右键菜单项颜色样式 - 通过图标和文字选择器 */
.context-menu-icon-enable,
.mx-context-menu-item:has(.context-menu-icon-enable) {
  color: #16a34a !important;
}

.mx-context-menu-item:has(.context-menu-icon-enable):hover {
  background-color: #dcfce7 !important;
}

.mx-context-menu-item:has(.context-menu-icon-enable):hover .context-menu-icon-enable,
.mx-context-menu-item:has(.context-menu-icon-enable):hover {
  color: #15803d !important;
}

.context-menu-icon-disable,
.mx-context-menu-item:has(.context-menu-icon-disable) {
  color: #ea580c !important;
}

.mx-context-menu-item:has(.context-menu-icon-disable):hover {
  background-color: #fff7ed !important;
}

.mx-context-menu-item:has(.context-menu-icon-disable):hover .context-menu-icon-disable,
.mx-context-menu-item:has(.context-menu-icon-disable):hover {
  color: #c2410c !important;
}

.context-menu-icon-rename,
.mx-context-menu-item:has(.context-menu-icon-rename) {
  color: #2563eb !important;
}

.mx-context-menu-item:has(.context-menu-icon-rename):hover {
  background-color: #dbeafe !important;
}

.mx-context-menu-item:has(.context-menu-icon-rename):hover .context-menu-icon-rename,
.mx-context-menu-item:has(.context-menu-icon-rename):hover {
  color: #1d4ed8 !important;
}

.context-menu-icon-delete,
.mx-context-menu-item:has(.context-menu-icon-delete) {
  color: #dc2626 !important;
}

.mx-context-menu-item:has(.context-menu-icon-delete):hover {
  background-color: #fee2e2 !important;
}

.mx-context-menu-item:has(.context-menu-icon-delete):hover .context-menu-icon-delete,
.mx-context-menu-item:has(.context-menu-icon-delete):hover {
  color: #b91c1c !important;
}

</style>
