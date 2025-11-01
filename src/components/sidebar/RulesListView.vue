<script setup lang="ts">
import { inject, h, type Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Trash2, Grip, CheckCircle, XCircle, Zap, FileText, ClipboardList, Pencil } from 'lucide-vue-next'
import { useEditorState } from '@/composables/useEditorState'
import { VueDraggable } from 'vue-draggable-plus'
import ContextMenu from '@imengyu/vue3-context-menu'

const editorState = useEditorState()

// 获取 EditorGroup 的引用（通过 inject）
const editorGroupRef = inject<Ref<{
  openRuleEditor: (index: number) => string
  openAdvancedEditor: () => string
  openConfigEditor: () => string
  openPreviewEditor: () => string
}> | null>('editorGroupRef')

// 打开规则编辑器
const openRuleEditor = (index: number) => {
  if (editorGroupRef?.value) {
    editorGroupRef.value.openRuleEditor(index)
  }
}

// 添加规则
const addRule = () => {
  editorState.rules.value.push({
    name: 'rule_' + Date.now(),
    enabled: true,
    salience: 10,
    noLoop: false,
    lockOnActive: false,
    when: '',
    then: '',
    visualMode: true
  })
  // 自动展开新添加的规则
  editorState.activeRules.value = editorState.rules.value.length - 1

  // 打开规则编辑器
  openRuleEditor(editorState.rules.value.length - 1)

  ElMessage.success('规则已添加')
}

// 确认删除规则
const confirmRemoveRule = (index: number) => {
  const rule = editorState.rules.value[index]
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
  editorState.rules.value.splice(index, 1)
  // 删除规则后调整 activeRules
  if (typeof editorState.activeRules.value === 'number' &&
      editorState.activeRules.value >= editorState.rules.value.length &&
      editorState.rules.value.length > 0) {
    editorState.activeRules.value = editorState.rules.value.length - 1
  } else if (editorState.rules.value.length === 0) {
    editorState.activeRules.value = -1
  }
}

// 重命名规则
const renameRule = (index: number) => {
  const rule = editorState.rules.value[index]
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

// 处理右键菜单
const handleContextMenu = (event: MouseEvent, index: number) => {
  event.preventDefault()
  event.stopPropagation()

  ContextMenu.showContextMenu({
    x: event.clientX,
    y: event.clientY,
    items: [
      {
        label: '重命名',
        icon: () => h(Pencil, { size: 14 }),
        onClick: () => {
          renameRule(index)
        },
        divided: true
      },
      {
        label: '删除',
        icon: () => h(Trash2, { size: 14 }),
        onClick: () => {
          confirmRemoveRule(index)
        },
      }
    ]
  })
}
</script>

<template>
  <div class="rules-list-view flex flex-col h-full">
    <!-- 工具栏 -->
    <div class="toolbar px-4 py-2.5 border-b border-gray-300 flex items-center justify-between bg-gray-50">
      <div class="flex items-center gap-2">
        <ClipboardList :size="16" class="text-gray-600" />
        <h3 class="text-sm font-semibold text-gray-900">规则列表</h3>
      </div>
      <el-button
        type="primary"
        size="small"
        @click="addRule"
      >
        <Plus :size="14" class="mr-1" />
        添加规则
      </el-button>
    </div>

    <!-- 规则列表 -->
    <div class="rules-list flex-1 overflow-auto p-2">
      <!-- 空状态 -->
      <div v-if="editorState.rules.value.length === 0" class="text-center py-12">
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
        v-model="editorState.rules.value"
        :animation="200"
        handle=".rule-drag-handle"
        ghostClass="rule-dragging-ghost"
      >
        <div
          v-for="(rule, index) in editorState.rules.value"
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
                  {{ rule.when || '无条件' }}
                </div>
              </div>
            </div>

            <!-- 删除按钮 -->
            <!-- <el-button
              text
              circle
              @click.stop="confirmRemoveRule(index)"
              title="删除规则"
            >
              <Trash2 :size="16" class="text-gray-500 hover:text-red-600" />
            </el-button> -->
          </div>
        </div>
      </VueDraggable>
    </div>
  </div>
</template>

<style scoped>
.rule-dragging-ghost {
  opacity: 0.5;
  background: #e5e7eb;
  border: 2px dashed #818cf8;
}

</style>
