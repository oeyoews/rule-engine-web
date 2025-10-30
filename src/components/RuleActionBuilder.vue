<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Plus, Grip, Phone, RefreshCw, PlusCircle, Trash2, Edit, Zap, Variable, Code2, Box, Sparkles } from 'lucide-vue-next'
import { loadClassData, type ClassData, type ClassMethod } from '@/utils/classImport'
import { VueDraggable } from 'vue-draggable-plus'

interface Action {
  id: string
  type: 'method' | 'function' | 'update' | 'insert' | 'retract' | 'modify'
  object: string
  method: string
  params: Array<{ value: string }>
  description?: string
}

const props = defineProps<{
  modelValue: string
  whenCondition?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const classData = ref<ClassData | null>(null)
const actions = ref<Action[]>([])
const isUpdatingFromCode = ref(false) // 防止循环更新

// 折叠状态
const activeActions = ref<string[]>([])

// 动作类型选项
const actionTypes = [
  { label: '调用方法', value: 'method', icon: Phone, color: 'text-blue-600' },
  { label: '更新对象 (update)', value: 'update', icon: RefreshCw, color: 'text-green-600' },
  { label: '插入对象 (insert)', value: 'insert', icon: PlusCircle, color: 'text-cyan-600' },
  { label: '删除对象 (retract)', value: 'retract', icon: Trash2, color: 'text-red-600' },
  { label: '修改对象 (modify)', value: 'modify', icon: Edit, color: 'text-orange-600' },
  { label: '调用函数', value: 'function', icon: Zap, color: 'text-purple-600' }
]

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
  // 自动展开新添加的动作
  activeActions.value.push(newAction.id)
  updateDrlCode()
}

// 删除动作
const removeAction = (id: string) => {
  actions.value = actions.value.filter(a => a.id !== id)
  updateDrlCode()
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

// 生成 DRL then 代码
const generateDrlCode = (): string => {
  if (actions.value.length === 0) return ''

  const lines: string[] = []

  actions.value.forEach(action => {
    let line = ''

    switch (action.type) {
      case 'method':
        if (action.object && action.method) {
          const paramStr = action.params.map(p => {
            // 如果参数值以$开头或是数字，不加引号
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

    if (line) {
      lines.push(`    ${line}`)
    }
  })

  return lines.join('\n')
}

// 更新 DRL 代码
const updateDrlCode = () => {
  isUpdatingFromCode.value = true
  const code = generateDrlCode()
  emit('update:modelValue', code)
  setTimeout(() => {
    isUpdatingFromCode.value = false
  }, 0)
}

// 解析 DRL 代码（初始化时使用）
const parseDrlCode = (code: string) => {
  if (!code || code.trim().length === 0) {
    actions.value = []
    return
  }

  try {
    const parsedActions: Action[] = []

    // 按分号分割多个语句
    const statements = code.split(';').map(s => s.trim()).filter(s => s.length > 0)

    for (const statement of statements) {
      let action: Action | null = null

      // 解析 update($变量)
      const updateMatch = statement.match(/update\s*\(\s*(\$\w+)\s*\)/)
      if (updateMatch) {
        action = {
          id: Date.now().toString() + Math.random(),
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
          id: Date.now().toString() + Math.random(),
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
          id: Date.now().toString() + Math.random(),
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
          id: Date.now().toString() + Math.random(),
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
          id: Date.now().toString() + Math.random(),
          type: isVariable ? 'method' : 'function',
          object: object || '',
          method: method || '',
          params: params
        }
      }

      if (action) {
        parsedActions.push(action)
      }
    }

    actions.value = parsedActions
  } catch (error) {
    console.error('解析 DRL then 代码失败:', error)
    // 解析失败时保持为空，让用户在代码模式下编辑
    actions.value = []
  }
}

// 加载类数据
onMounted(async () => {
  classData.value = await loadClassData()

  if (props.modelValue && props.modelValue.trim()) {
    parseDrlCode(props.modelValue)
  } else {
    // 只有在没有初始值时才添加默认动作
    addAction()
  }
})

// 监听外部代码变化（如从代码模式切换回来）
watch(() => props.modelValue, (newValue) => {
  if (!isUpdatingFromCode.value && newValue) {
    parseDrlCode(newValue)
  }
})

// 获取方法的参数信息
const getMethodParams = (action: Action): ClassMethod | undefined => {
  const methods = getObjectMethods(action.object)
  return methods.find(m => m.name === action.method)
}
</script>

<template>
  <div class="action-builder">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <Sparkles :size="18" class="text-green-600 shrink-0" />
        <span class="text-sm font-medium text-gray-700">动作构建器</span>
        <el-tag size="small" type="success">可视化</el-tag>
      </div>
      <el-button
        size="small"
        type="success"
        :icon="Plus"
        @click="addAction"
      >
        添加动作
      </el-button>
    </div>

    <el-collapse v-model="activeActions">
      <VueDraggable
        v-model="actions"
        :animation="200"
        handle=".drag-handle"
        ghostClass="dragging-ghost"
        @end="updateDrlCode"
      >
        <el-collapse-item
          v-for="(action, index) in actions"
          :key="action.id"
          :name="action.id"
        >
          <template #title>
            <div class="flex items-center gap-2 py-1 w-full">
              <div class="drag-handle flex items-center justify-center size-8 cursor-move hover:bg-green-200 rounded transition-colors shrink-0 ml-2">
                <Grip :size="16" class="text-green-600" />
              </div>
              <div class="text-sm font-medium text-gray-700">
                动作{{ index + 1 }}:
                <el-tag size="small" :type="action.type === 'method' || action.type === 'function' ? 'primary' : 'success'" class="ml-1">
                  {{ actionTypes.find(t => t.value === action.type)?.label || action.type }}
                </el-tag>
                <span v-if="action.object" class="text-green-600 ml-4">
                  {{ action.object }}<span v-if="action.method" class="text-gray-500">.{{ action.method }}()</span>
                </span>
              </div>
            </div>
          </template>
          <div class="p-3 bg-green-50 rounded-lg border border-green-200 mt-2 ml-4">
            <div class="mb-3">
              <label class="text-xs text-gray-600 mb-1 block">① 动作类型</label>
              <el-radio-group v-model="action.type" size="small" @change="updateDrlCode">
                <el-radio-button
                  v-for="type in actionTypes"
                  :key="type.value"
                  :label="type.value"
                >
                  <span class="inline-flex items-center gap-1.5">
                    <component :is="type.icon" :size="14" :class="type.color" />
                    <span>{{ type.label }}</span>
                  </span>
                </el-radio-button>
              </el-radio-group>
            </div>

        <!-- 调用方法 -->
        <div v-if="action.type === 'method' || action.type === 'function'" class="space-y-2">
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
                      <!-- <span class="text-xs text-gray-500">{{ method.description }}</span> -->
                    </div>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>

          <!-- 方法参数 -->
          <div v-if="action.params.length > 0" class="pl-4 border-l-2 border-green-300">
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
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Update/Insert/Retract -->
        <div v-else-if="['update', 'insert', 'retract'].includes(action.type)">
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
        <div v-else-if="action.type === 'modify'" class="space-y-2">
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
            />
            </div>
          </div>

          <!-- 删除按钮 -->
          <div class="flex justify-end mt-3 pt-3 border-t border-green-300">
            <el-button
              @click.stop="removeAction(action.id)"
              size="small"
              plain
              class="border-red-300! text-red-600! hover:bg-red-50! hover:border-red-400! hover:text-red-700!"
            >
              <Trash2 :size="16" class="mr-1" />
              删除动作
            </el-button>
          </div>
          </div>
        </el-collapse-item>
      </VueDraggable>
    </el-collapse>

    <!-- 生成的代码预览 -->
    <div class="mt-3 ml-4">
      <el-collapse>
        <el-collapse-item name="preview">
          <template #title>
            <div class="flex items-center gap-2">
              <Code2 :size="16" class="text-green-600 shrink-0" />
              <span class="text-sm">查看生成的代码</span>
            </div>
          </template>
          <pre class="bg-gray-900 text-orange-400 p-3 rounded text-xs font-mono">{{ generateDrlCode() || '// 请配置动作' }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<style scoped>
.action-builder {
  width: 100%;
}

.action-item {
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

/* 拖拽时的幽灵元素样式 */
.dragging-ghost {
  opacity: 0.5;
  background: #d1fae5;
  border: 2px dashed #10b981;
}

/* 禁用 el-tag 的所有过渡动画 */
:deep(.el-tag) {
  transition: none !important;
  animation: none !important;
}

/* 折叠面板标题样式 */
.action-item :deep(.el-collapse-item__header) {
  background: #f0fdf4;
  border: 1px solid #d1fae5;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0;
  transition: all 0.2s;
}

.action-item :deep(.el-collapse-item__header:hover) {
  background: #dcfce7;
  border-color: #4ade80;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.action-item :deep(.el-collapse-item__wrap) {
  border: none;
  background: transparent;
}

.action-item :deep(.el-collapse-item__content) {
  padding-bottom: 0;
}

/* 动作内容区域样式 */
.action-item :deep(.el-collapse-item__content) .bg-green-50 {
  transition: all 0.2s;
}

.action-item :deep(.el-collapse-item__content) .bg-green-50:hover {
  border-color: #4ade80;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
</style>

