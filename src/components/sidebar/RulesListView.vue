<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Trash2, Grip, CheckCircle, XCircle, Zap, FileText } from 'lucide-vue-next'
import { useEditorState } from '@/composables/useEditorState'
import { VueDraggable } from 'vue-draggable-plus'

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
  const ruleName = editorState.rules.value[index].name || `规则 ${index + 1}`
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
</script>

<template>
  <div class="rules-list-view flex flex-col h-full">
    <!-- 工具栏 -->
    <div class="toolbar px-4 py-2 border-b border-gray-700 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-200">规则列表</h3>
      <button
        @click="addRule"
        class="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
      >
        <Plus :size="14" />
        添加规则
      </button>
    </div>

    <!-- 规则列表 -->
    <div class="rules-list flex-1 overflow-auto p-2">
      <!-- 空状态 -->
      <div v-if="editorState.rules.value.length === 0" class="text-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
            <FileText :size="40" class="text-gray-400" />
          </div>
          <p class="text-gray-400 text-sm">暂无规则</p>
          <button
            @click="addRule"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            添加第一个规则
          </button>
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
          class="rule-item bg-gray-700 hover:bg-gray-650 rounded p-3 mb-2 cursor-pointer transition-colors"
          @click="openRuleEditor(index)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <!-- 拖拽手柄 -->
              <div class="rule-drag-handle flex items-center justify-center size-6 cursor-move hover:bg-gray-600 rounded transition-colors">
                <Grip :size="14" class="text-gray-400" />
              </div>

              <!-- 规则编号 -->
              <div class="flex items-center justify-center size-6 bg-indigo-600 rounded-full text-white font-bold text-xs shrink-0">
                {{ index + 1 }}
              </div>

              <!-- 规则信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-gray-200 text-sm truncate">
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
                    :class="rule.enabled ? 'bg-emerald-600 text-white border-none' : 'bg-gray-600 text-gray-300 border-none'"
                  >
                    <span class="inline-flex items-center gap-1">
                      <CheckCircle v-if="rule.enabled" :size="12" />
                      <XCircle v-else :size="12" />
                      {{ rule.enabled ? '启用' : '禁用' }}
                    </span>
                  </el-tag>
                </div>
                <div class="text-xs text-gray-400 truncate">
                  {{ rule.when || '无条件' }}
                </div>
              </div>
            </div>

            <!-- 删除按钮 -->
            <button
              @click.stop="confirmRemoveRule(index)"
              class="ml-2 p-1 hover:bg-red-600 rounded transition-colors shrink-0"
              title="删除规则"
            >
              <Trash2 :size="16" class="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </VueDraggable>
    </div>
  </div>
</template>

<style scoped>
.rule-dragging-ghost {
  opacity: 0.5;
  background: #4b5563;
  border: 2px dashed #818cf8;
}

.toolbar {
  background: #1f2937;
}
</style>
