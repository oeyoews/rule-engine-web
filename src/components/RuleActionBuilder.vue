<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Phone, RefreshCw, PlusCircle, Trash2, Edit, Zap, Variable, Code2, Box, Sparkles } from 'lucide-vue-next'
import { loadClassData, type ClassData, type ClassMethod } from '@/utils/classImport'

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

// 添加动作 - 确保只有一个动作
const addAction = () => {
  if (actions.value.length === 0) {
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
}

// 删除动作功能已移除，每个规则只能有一个动作

// 获取当前动作（用于模板）
const currentAction = computed(() => actions.value[0])

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

// 生成 DRL then 代码 - 只生成第一个动作
const generateDrlCode = (): string => {
  if (actions.value.length === 0) return ''

  const action = actions.value[0]
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

// 更新 DRL 代码
const updateDrlCode = () => {
  isUpdatingFromCode.value = true
  const code = generateDrlCode()
  emit('update:modelValue', code)
  setTimeout(() => {
    isUpdatingFromCode.value = false
  }, 0)
}

// 解析 DRL 代码（初始化时使用）- 只解析第一个动作
const parseDrlCode = (code: string) => {
  if (!code || code.trim().length === 0) {
    actions.value = []
    return
  }

  try {
    // 按分号分割多个语句，只取第一个
    const statements = code.split(';').map(s => s.trim()).filter(s => s.length > 0)
    if (statements.length === 0) {
      actions.value = []
      return
    }

    const statement = statements[0]
    if (!statement) {
      actions.value = []
      return
    }

    let action: Action | null = null

    // 解析 update($变量)
    const updateMatch = statement.match(/update\s*\(\s*(\$\w+)\s*\)/)
    if (updateMatch) {
      action = {
        id: Date.now().toString(),
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
        id: Date.now().toString(),
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
        id: Date.now().toString(),
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
        id: Date.now().toString(),
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
        id: Date.now().toString(),
        type: isVariable ? 'method' : 'function',
        object: object || '',
        method: method || '',
        params: params
      }
    }

    if (action) {
      actions.value = [action]
    } else {
      actions.value = []
    }
  } catch (error) {
    console.error('解析 DRL then 代码失败:', error)
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
  if (!isUpdatingFromCode.value) {
    if (newValue && newValue.trim()) {
      parseDrlCode(newValue)
    }
    // 如果解析后没有动作，添加默认动作
    if (actions.value.length === 0) {
      addAction()
    }
  }
})

// 获取方法的参数信息
const getMethodParams = (action: Action): ClassMethod | undefined => {
  const methods = getObjectMethods(action.object)
  return methods.find(m => m.name === action.method)
}
</script>

<template>
  <div class="w-full">
    <div class="flex items-center gap-2 mb-3">
      <Sparkles :size="18" class="text-green-600 shrink-0" />
      <span class="text-sm font-medium text-gray-700">动作构建器</span>
      <el-tag size="small" type="success">可视化</el-tag>
    </div>

    <div v-if="currentAction" class="p-3 bg-green-50 rounded-lg border border-green-200">
          <div class="mb-3">
            <label class="text-xs text-gray-600 mb-1 block">① 动作类型</label>
            <el-segmented
              v-if="currentAction"
              v-model="currentAction.type"
              size="default"
              @change="updateDrlCode"
              class="w-full"
              :options="actionTypes.map(type => ({
                label: type.label,
                value: type.value,
                icon: type.icon,
                color: type.color
              }))"
            >
              <template #default="scope">
                <span class="inline-flex items-center gap-1.5">
                  <component
                    :is="scope.item.icon"
                    :size="14"
                    :class="scope.item.color"
                  />
                  <span>{{ scope.item.label }}</span>
                </span>
              </template>
            </el-segmented>
          </div>

          <!-- 调用方法 -->
          <div v-if="currentAction && (currentAction.type === 'method' || currentAction.type === 'function')" class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs text-gray-600 mb-1 block">② 对象/类</label>
                <el-select
                  v-if="currentAction.type === 'method'"
                  v-model="currentAction.object"
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
                  v-model="currentAction.object"
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
                  v-if="currentAction"
                  v-model="currentAction.method"
                  size="small"
                  placeholder="选择方法"
                  filterable
                  @change="onMethodChange(currentAction)"
                  :disabled="!currentAction.object"
                  class="w-full"
                >
                  <template #prefix>
                    <Code2 :size="14" class="text-green-600 ml-1" />
                  </template>
                  <el-option
                    v-for="method in getObjectMethods(currentAction.object)"
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
            <div v-if="currentAction && currentAction.params.length > 0" class="pl-4 border-l-2 border-green-300">
              <label class="text-xs text-gray-600 mb-2 block">④ 参数</label>
              <div class="space-y-2">
                <div
                  v-for="(param, pIndex) in currentAction.params"
                  :key="pIndex"
                  class="flex items-center gap-2"
                >
                  <span class="text-xs text-gray-500 w-20">
                    {{ getMethodParams(currentAction)?.params[pIndex]?.name || `参数${pIndex + 1}` }}
                    ({{ getMethodParams(currentAction)?.params[pIndex]?.type }})
                  </span>
                  <el-input
                    v-model="param.value"
                    size="small"
                    :placeholder="`输入${getMethodParams(currentAction)?.params[pIndex]?.type}`"
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
          <div v-else-if="currentAction && ['update', 'insert', 'retract'].includes(currentAction.type)">
            <label class="text-xs text-gray-600 mb-1 block">② 对象变量</label>
            <el-select
              v-model="currentAction.object"
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
          <div v-else-if="currentAction && currentAction.type === 'modify'" class="space-y-2">
            <div>
              <label class="text-xs text-gray-600 mb-1 block">② 对象变量</label>
              <el-select
                v-model="currentAction.object"
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
                v-model="currentAction.method"
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

</style>


