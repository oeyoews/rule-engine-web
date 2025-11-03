<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Variable, Code2, Box, Sparkles, Plus, Trash2, Edit, Grip, MessageSquare } from 'lucide-vue-next'
import { loadClassData, type ClassData, type ClassMethod } from '@/utils/classImport'
import { actionTypes } from '@/constants/actions'
import { VueDraggable } from 'vue-draggable-plus'

const modelValue = defineModel<string>()
const props = defineProps<{
  whenCondition?: string
}>()

const classData = ref<ClassData | null>(null)
const actions = ref<Action[]>([])
const isUpdatingFromCode = ref(false) // 防止循环更新

/**
 * 从 when 条件中提取变量
 * 匹配模式: $变量名: 类名(...)
 * 例如: $p: Person(age >= 18) -> 提取 $p
 */
const extractVariablesFromWhen = computed(() => {
  if (!props.whenCondition) return []

  const variables: Array<{ label: string; value: string }> = []

  // 匹配 $变量名: 类名 的模式
  const regex = /\$(\w+)\s*:\s*(\w+)/g
  let match

  while ((match = regex.exec(props.whenCondition)) !== null) {
    const varName = `$${match[1]}`
    const className = match[2]
    variables.push({
      label: `${varName} (${className})`,
      value: varName
    })
  }

  return variables
})

// 获取所有可用的类和方法（用于函数类型）
const availableObjects = computed(() => {
  if (!classData.value) return []
  const objects: Array<{ label: string; value: string; type: string }> = []

  // 添加工具类
  classData.value.utilities.forEach(util => {
    objects.push({
      label: `${util.name} (${util.description})`,
      value: util.name,
      type: 'utility'
    })
  })

  // 添加服务类
  classData.value.services.forEach(service => {
    objects.push({
      label: `${service.name} (${service.description})`,
      value: service.name,
      type: 'service'
    })
  })

  return objects
})

// 获取指定对象的方法
const getObjectMethods = (objectName: string): ClassMethod[] => {
  if (!classData.value || !objectName) return []

  const allClasses = [
    ...classData.value.classes,
    ...classData.value.utilities,
    ...classData.value.services
  ]

  const classInfo = allClasses.find(c => c.name === objectName || objectName.startsWith('$'))
  return classInfo?.methods || []
}

// 添加动作
const addAction = () => {
  const newAction: Action = {
    id: Date.now().toString(),
    type: 'method',
    object: '',
    method: '',
    params: []
  }
  actions.value.push(newAction)
  updateDrlCode()
}

// 删除动作
const removeAction = (id: string) => {
  const index = actions.value.findIndex(a => a.id === id)
  if (index > -1) {
    actions.value.splice(index, 1)
    updateDrlCode()
  }
}

// 当方法改变时，更新参数列表
const onMethodChange = (action: Action) => {
  const methods = getObjectMethods(action.object)
  const method = methods.find(m => m.name === action.method)

  if (method) {
    action.params = method.params.map(() => ({ value: '' }))
  } else {
    action.params = []
  }

  updateDrlCode()
}

// 生成单个动作的代码
const generateSingleActionCode = (action: Action): string => {
  if (!action) return ''

  let line = ''

  switch (action.type) {
    case 'method':
      if (action.object && action.method) {
        const paramStr = action.params.map(p => {
          if (p.value.startsWith('$') || !isNaN(Number(p.value)) || p.value === 'true' || p.value === 'false') {
            return p.value
          }
          return `"${p.value}"`
        }).join(', ')

        line = `${action.object}.${action.method}(${paramStr});`
      }
      break

    case 'update':
      if (action.object) {
        line = `update(${action.object});`
      }
      break

    case 'insert':
      if (action.object) {
        line = `insert(${action.object});`
      }
      break

    case 'retract':
      if (action.object) {
        line = `retract(${action.object});`
      }
      break

    case 'modify':
      if (action.object && action.method) {
        const paramStr = action.params.map(p => p.value).join(', ')
        line = `modify(${action.object}) { ${action.method}(${paramStr}) };`
      }
      break

    case 'function':
      if (action.object && action.method) {
        const paramStr = action.params.map(p => {
          if (p.value.startsWith('$') || !isNaN(Number(p.value))) {
            return p.value
          }
          return `"${p.value}"`
        }).join(', ')

        line = `${action.object}.${action.method}(${paramStr});`
      }
      break
  }

  return line ? `    ${line}` : ''
}

// 生成 DRL then 代码 - 生成所有动作
const generateDrlCode = (): string => {
  if (actions.value.length === 0) return ''

  const lines: string[] = []

  actions.value.forEach(action => {
    const code = generateSingleActionCode(action)
    if (code) {
      // 如果有描述，添加行内注释
      if (action.description && action.description.trim()) {
        const codeWithComment = code.trim().endsWith(';')
          ? code.trim().slice(0, -1) + ` // ${action.description.trim()};`
          : code + ` // ${action.description.trim()}`
        lines.push(codeWithComment)
      } else {
        lines.push(code)
      }
    }
  })

  return lines.join('\n')
}

// 更新 DRL 代码
const updateDrlCode = () => {
  isUpdatingFromCode.value = true
  const code = generateDrlCode()
  modelValue.value = code
  setTimeout(() => {
    isUpdatingFromCode.value = false
  }, 0)
}

// 解析单个语句为动作
const parseStatement = (statement: string, index: number): Action | null => {
  let action: Action | null = null

  // 解析 update($变量)
  const updateMatch = statement.match(/update\s*\(\s*(\$\w+)\s*\)/)
  if (updateMatch) {
    action = {
      id: `${Date.now()}-${index}`,
      type: 'update',
      object: updateMatch[1] || '',
      method: '',
      params: []
    }
  }

  // 解析 insert(new 类名(...))
  const insertMatch = statement.match(/insert\s*\(\s*new\s+(\w+)\s*\(([^)]*)\)\s*\)/)
  if (!action && insertMatch) {
    const className = insertMatch[1]
    const paramsStr = insertMatch[2]?.trim() || ''
    const params = paramsStr ? paramsStr.split(',').map(p => ({ value: p.trim().replace(/['"]/g, '') })) : []

    action = {
      id: `${Date.now()}-${index}`,
      type: 'insert',
      object: className || '',
      method: '',
      params: params
    }
  }

  // 解析 delete/retract($变量)
  const deleteMatch = statement.match(/(?:delete|retract)\s*\(\s*(\$\w+)\s*\)/)
  if (!action && deleteMatch) {
    action = {
      id: `${Date.now()}-${index}`,
      type: 'retract',
      object: deleteMatch[1] || '',
      method: '',
      params: []
    }
  }

  // 解析 modify($变量) { 方法(...) }
  const modifyMatch = statement.match(/modify\s*\(\s*(\$\w+)\s*\)\s*\{\s*(\w+)\s*\(([^)]*)\)\s*\}/)
  if (!action && modifyMatch) {
    const object = modifyMatch[1]
    const method = modifyMatch[2]
    const paramsStr = modifyMatch[3]?.trim() || ''
    const params = paramsStr ? paramsStr.split(',').map(p => ({ value: p.trim().replace(/['"]/g, '') })) : []

    action = {
      id: `${Date.now()}-${index}`,
      type: 'modify',
      object: object || '',
      method: method || '',
      params: params
    }
  }

  // 解析普通方法调用：$变量.方法(...) 或 对象.方法(...)
  const methodMatch = statement.match(/(\$?\w+)\.(\w+)\s*\(([^)]*)\)/)
  if (!action && methodMatch) {
    const object = methodMatch[1]
    const method = methodMatch[2]
    const paramsStr = methodMatch[3]?.trim() || ''
    const params = paramsStr ? paramsStr.split(',').map(p => ({ value: p.trim().replace(/['"]/g, '') })) : []

    // 判断是方法调用还是函数调用
    const isVariable = object?.startsWith('$')

    action = {
      id: `${Date.now()}-${index}`,
      type: isVariable ? 'method' : 'function',
      object: object || '',
      method: method || '',
      params: params
    }
  }

  return action
}

// 解析 DRL 代码（初始化时使用）- 解析所有动作
const parseDrlCode = (code: string) => {
  if (!code || code.trim().length === 0) {
    actions.value = []
    return
  }

  try {
    // 按行处理，保留注释信息
    const lines = code.split('\n')
    const parsedActions: Action[] = []
    let pendingDescription = ''

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i]
      if (!currentLine) continue

      const line = currentLine.trim()

      // 跳过空行
      if (!line) {
        pendingDescription = '' // 空行重置待处理的描述
        continue
      }

      // 检查是否是注释（动作描述）
      const commentMatch = line.match(/^\s*\/\/\s*@description:\s*(.+)$/i)
      if (commentMatch?.[1]) {
        pendingDescription = commentMatch[1].trim()
        continue
      }

      // 移除行首缩进
      let cleanedLine = line.replace(/^\s+/, '')

      // 提取行内注释（如果有）
      let inlineDescription = ''
      const inlineCommentMatch = cleanedLine.match(/\s+\/\/\s+(.+)$/)
      if (inlineCommentMatch?.[1]) {
        inlineDescription = inlineCommentMatch[1].trim()
        cleanedLine = cleanedLine.replace(/\s+\/\/\s+.+$/, '').trim()
      }

      // 处理完整的语句（可能包含分号）
      const statements = cleanedLine.split(';').map(s => s.trim()).filter(s => s.length > 0)

      statements.forEach((statement, stmtIndex) => {
        const action = parseStatement(statement, parsedActions.length + stmtIndex)
        if (action) {
          // 优先使用行内注释，其次使用待处理的描述
          if (inlineDescription) {
            action.description = inlineDescription
          } else if (pendingDescription) {
            action.description = pendingDescription
            pendingDescription = '' // 使用后清空（每个动作只使用一次描述）
          }
          parsedActions.push(action)
        }
      })
    }

    actions.value = parsedActions
  } catch (error) {
    console.error('解析 DRL then 代码失败:', error)
    actions.value = []
  }
}

// 加载类数据
onMounted(async () => {
  classData.value = await loadClassData()

  if (modelValue.value && modelValue.value.trim()) {
    parseDrlCode(modelValue.value)
  } else {
    // 只有在没有初始值时才添加默认动作
    // addAction()
  }
})

// 监听外部代码变化（如从代码模式切换回来）
watch(modelValue, (newValue) => {
  if (!isUpdatingFromCode.value) {
    if (newValue && newValue.trim()) {
      parseDrlCode(newValue)
  } else {
    // 如果代码为空或只有空白，清空动作
    actions.value = []
  }
    // 如果解析后没有动作，或者代码为空，添加默认动作
    if (actions.value.length === 0) {
      addAction()
    }
  }
}, { immediate: true })

// 获取方法的参数信息
const getMethodParams = (action: Action): ClassMethod | undefined => {
  const methods = getObjectMethods(action.object)
  return methods.find(m => m.name === action.method)
}
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <Sparkles :size="18" class="text-green-600 shrink-0" />
        <span class="text-sm font-medium text-gray-700">动作构建器</span>
        <el-tag size="small" type="success">可视化</el-tag>
      </div>
      <el-button type="primary" size="small" @click="addAction">
        <Plus :size="14" class="mr-1" />
        添加动作
      </el-button>
    </div>

    <VueDraggable
      v-if="actions.length > 0"
      v-model="actions"
      :animation="200"
      handle=".action-drag-handle"
      ghostClass="action-dragging-ghost"
      @end="updateDrlCode"
      class="space-y-3"
    >
      <div
        v-for="action in actions"
        :key="action.id"
        class="p-3 bg-green-50 rounded-lg border border-green-200"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="action-drag-handle flex items-center justify-center size-6 cursor-move hover:bg-green-200 rounded transition-colors shrink-0 mt-1">
            <Grip :size="14" class="text-green-600" />
          </div>
          <div class="flex-1">
            <div class="mb-3">
              <label class="text-xs text-gray-600 mb-1 block">① 动作类型</label>
              <el-select
                v-model="action.type"
                size="small"
                @change="updateDrlCode"
                class="w-full"
                placeholder="选择动作类型"
              >
                <template #prefix>
                  <component
                    :is="actionTypes.find(t => t.value === action?.type)?.icon"
                    :size="14"
                    :class="actionTypes.find(t => t.value === action?.type)?.color || 'text-gray-600'"
                    class="ml-1"
                  />
                </template>
                <el-option
                  v-for="type in actionTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                >
                  <div class="flex items-center gap-2">
                    <component
                      :is="type.icon"
                      :size="16"
                      :class="type.color"
                    />
                    <span>{{ type.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- 调用方法 -->
            <div v-if="action && (action.type === 'method' || action.type === 'function')" class="space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-xs text-gray-600 mb-1 block">② 对象/类</label>
                  <el-select
                    v-if="action.type === 'method'"
                    v-model="action.object"
                    size="small"
                    placeholder="选择或输入变量名"
                    filterable
                    allow-create
                    default-first-option
                    @change="updateDrlCode"
                    class="w-full"
                  >
                    <template #prefix>
                      <Variable :size="14" class="text-blue-600 ml-1" />
                    </template>
                    <el-option-group label="条件中的变量">
                      <el-option
                        v-for="variable in extractVariablesFromWhen"
                        :key="variable.value"
                        :label="variable.label"
                        :value="variable.value"
                      >
                        <div class="flex items-center gap-2">
                          <Variable :size="16" class="text-blue-600" />
                          <span>{{ variable.label }}</span>
                        </div>
                      </el-option>
                    </el-option-group>
                    <el-option-group v-if="extractVariablesFromWhen.length === 0" label="提示">
                      <el-option
                        value=""
                        label="在条件中定义变量后会显示在这里"
                        disabled
                      />
                    </el-option-group>
                  </el-select>
                  <el-select
                    v-else
                    v-model="action.object"
                    size="small"
                    placeholder="选择工具类"
                    filterable
                    @change="updateDrlCode"
                    class="w-full"
                  >
                    <template #prefix>
                      <Box :size="14" class="text-indigo-600 ml-1" />
                    </template>
                    <el-option
                      v-for="obj in availableObjects"
                      :key="obj.value"
                      :label="obj.label"
                      :value="obj.value"
                    >
                      <div class="flex items-center gap-2">
                        <Box :size="16" class="text-indigo-600" />
                        <span>{{ obj.label }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </div>

                <div>
                  <label class="text-xs text-gray-600 mb-1 block">③ 方法</label>
                  <el-select
                    v-model="action.method"
                    size="small"
                    placeholder="选择方法"
                    filterable
                    @change="onMethodChange(action)"
                    :disabled="!action.object"
                    class="w-full"
                  >
                    <template #prefix>
                      <Code2 :size="14" class="text-green-600 ml-1" />
                    </template>
                    <el-option
                      v-for="method in getObjectMethods(action.object)"
                      :key="method.name"
                      :label="method.name"
                      :value="method.name"
                    >
                      <div class="flex items-center gap-2">
                        <Code2 :size="16" class="text-green-600" />
                        <div class="flex flex-col">
                          <span>{{ method.name }}</span>
                        </div>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>

              <!-- 方法参数 -->
              <div v-if="action && action.params.length > 0" class="pl-4 border-l-2 border-green-300">
                <label class="text-xs text-gray-600 mb-2 block">④ 参数</label>
                <div class="space-y-2">
                  <div
                    v-for="(param, pIndex) in action.params"
                    :key="pIndex"
                    class="flex items-center gap-2"
                  >
                    <span class="text-xs text-gray-500 w-20">
                      {{ getMethodParams(action)?.params[pIndex]?.name || `参数${pIndex + 1}` }}
                      ({{ getMethodParams(action)?.params[pIndex]?.type }})
                    </span>
                    <el-input
                      v-model="param.value"
                      size="small"
                      :placeholder="`输入${getMethodParams(action)?.params[pIndex]?.type}`"
                      @change="updateDrlCode"
                      class="flex-1"
                    >
                      <template #prefix>
                        <Code2 :size="14" class="text-emerald-600 ml-1" />
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>
            </div>

            <!-- Update/Insert/Retract -->
            <div v-else-if="action && ['update', 'insert', 'retract'].includes(action.type)">
              <label class="text-xs text-gray-600 mb-1 block">② 对象变量</label>
              <el-select
                v-model="action.object"
                size="small"
                placeholder="选择或输入变量名"
                filterable
                allow-create
                default-first-option
                @change="updateDrlCode"
                class="w-full"
              >
                <template #prefix>
                  <Variable :size="14" class="text-blue-600 ml-1" />
                </template>
                <el-option-group label="条件中的变量">
                  <el-option
                    v-for="variable in extractVariablesFromWhen"
                    :key="variable.value"
                    :label="variable.label"
                    :value="variable.value"
                  >
                    <div class="flex items-center gap-2">
                      <Variable :size="16" class="text-blue-600" />
                      <span>{{ variable.label }}</span>
                    </div>
                  </el-option>
                </el-option-group>
                <el-option-group v-if="extractVariablesFromWhen.length === 0" label="提示">
                  <el-option
                    value=""
                    label="在条件中定义变量后会显示在这里"
                    disabled
                  />
                </el-option-group>
              </el-select>
            </div>

            <!-- Modify -->
            <div v-else-if="action && action.type === 'modify'" class="space-y-2">
              <div>
                <label class="text-xs text-gray-600 mb-1 block">② 对象变量</label>
                <el-select
                  v-model="action.object"
                  size="small"
                  placeholder="选择或输入变量名"
                  filterable
                  allow-create
                  default-first-option
                  @change="updateDrlCode"
                  class="w-full"
                >
                  <template #prefix>
                    <Variable :size="14" class="text-blue-600 ml-1" />
                  </template>
                  <el-option-group label="条件中的变量">
                    <el-option
                      v-for="variable in extractVariablesFromWhen"
                      :key="variable.value"
                      :label="variable.label"
                      :value="variable.value"
                    >
                      <div class="flex items-center gap-2">
                        <Variable :size="16" class="text-blue-600" />
                        <span>{{ variable.label }}</span>
                      </div>
                    </el-option>
                  </el-option-group>
                  <el-option-group v-if="extractVariablesFromWhen.length === 0" label="提示">
                    <el-option
                      value=""
                      label="在条件中定义变量后会显示在这里"
                      disabled
                    />
                  </el-option-group>
                </el-select>
              </div>
              <div>
                <label class="text-xs text-gray-600 mb-1 block">③ 修改方法</label>
                <el-input
                  v-model="action.method"
                  size="small"
                  placeholder="方法名"
                  @change="updateDrlCode"
                >
                  <template #prefix>
                    <Edit :size="14" class="text-orange-600 ml-1" />
                  </template>
                </el-input>
              </div>
            </div>

            <!-- 描述 -->
            <div class="mt-3 pt-3 border-t border-green-200">
              <label class="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <MessageSquare :size="12" class="text-green-500" />
                描述（可选）
              </label>
              <el-input
                v-model="action.description"
                size="small"
                placeholder="输入动作描述（将生成为行内注释）"
                @change="updateDrlCode"
                maxlength="100"
                show-word-limit
              />
            </div>
          </div>
          <div class="flex justify-end">
            <el-button
              type="danger"
              size="small"
              :icon="Trash2"
              circle
              @click="removeAction(action.id)"
            />
          </div>
        </div>
      </div>
    </VueDraggable>

    <div v-else class="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500 text-sm">
      暂无动作，点击"添加动作"按钮开始添加
    </div>

    <!-- 生成的代码预览 -->
    <div class="mt-3">
      <div class="mb-2 flex items-center gap-2">
        <Code2 :size="16" class="text-green-600 shrink-0" />
        <span class="text-sm font-medium text-gray-700">生成的代码</span>
      </div>
      <pre class="bg-gray-900 text-orange-400 p-3 rounded text-xs font-mono">{{ generateDrlCode() || '// 请配置动作' }}</pre>
    </div>
  </div>
</template>

<style scoped>
.action-item {
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

/* 拖拽时的幽灵元素样式 */
.action-dragging-ghost {
  opacity: 0.5;
  background: #d1fae5;
  border: 2px dashed #10b981;
}
</style>


