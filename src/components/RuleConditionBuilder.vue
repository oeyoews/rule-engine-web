<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Plus, X, GripVertical, Ampersand, Split } from 'lucide-vue-next'
import { loadClassData, type ClassData, type ClassField } from '@/utils/classImport'
import { VueDraggable } from 'vue-draggable-plus'

interface Condition {
  id: string
  variable: string
  className: string
  field: string
  operator: string
  value: string
  logicOperator?: 'AND' | 'OR'
}

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const classData = ref<ClassData | null>(null)
const conditions = ref<Condition[]>([])
const isUpdatingFromCode = ref(false) // 防止循环更新

// 操作符选项
const operators = [
  { label: '等于 (==)', value: '==' },
  { label: '不等于 (!=)', value: '!=' },
  { label: '大于 (>)', value: '>' },
  { label: '小于 (<)', value: '<' },
  { label: '大于等于 (>=)', value: '>=' },
  { label: '小于等于 (<=)', value: '<=' },
  { label: '包含 (contains)', value: 'contains' },
  { label: '匹配 (matches)', value: 'matches' },
  { label: '在...中 (memberOf)', value: 'memberOf' }
]

// 逻辑操作符
const logicOperators = [
  { label: '并且 (AND)', value: 'AND', icon: Ampersand, color: 'text-blue-600' },
  { label: '或者 (OR)', value: 'OR', icon: Split, color: 'text-orange-600' }
]

// 获取所有可用的类
const availableClasses = computed(() => {
  if (!classData.value) return []
  return [...classData.value.classes, ...classData.value.utilities, ...classData.value.services]
})

// 获取指定类的字段
const getClassFields = (className: string): ClassField[] => {
  if (!classData.value || !className) return []
  const classInfo = availableClasses.value.find(c => c.name === className)
  return classInfo?.fields || []
}

// 添加条件
const addCondition = () => {
  const newCondition: Condition = {
    id: Date.now().toString(),
    variable: `p${conditions.value.length + 1}`,
    className: '',
    field: '',
    operator: '==',
    value: '',
    logicOperator: conditions.value.length > 0 ? 'AND' : undefined
  }
  conditions.value.push(newCondition)
  updateDrlCode()
}

// 删除条件
const removeCondition = (id: string) => {
  conditions.value = conditions.value.filter(c => c.id !== id)
  // 如果删除后第一个条件有逻辑操作符，移除它
  if (conditions.value.length > 0) {
    const firstCondition = conditions.value[0]
    if (firstCondition && firstCondition.logicOperator) {
      firstCondition.logicOperator = undefined
    }
  }
  updateDrlCode()
}

// 生成 DRL when 代码
const generateDrlCode = (): string => {
  if (conditions.value.length === 0) return ''

  const lines: string[] = []

  conditions.value.forEach((condition, index) => {
    if (!condition.className || !condition.field) return

    let line = ''

    // 添加逻辑操作符
    if (index > 0 && condition.logicOperator) {
      line += `${condition.logicOperator.toLowerCase()} `
    }

    // 生成条件表达式
    const varPrefix = `$${condition.variable}`

    if (condition.operator === 'contains') {
      line += `${varPrefix}: ${condition.className}(${condition.field} contains "${condition.value}")`
    } else if (condition.operator === 'matches') {
      line += `${varPrefix}: ${condition.className}(${condition.field} matches "${condition.value}")`
    } else if (condition.operator === 'memberOf') {
      line += `${varPrefix}: ${condition.className}(${condition.field} memberOf ${condition.value})`
    } else {
      // 判断值的类型来决定是否加引号
      const fieldInfo = getClassFields(condition.className).find(f => f.name === condition.field)
      const isStringType = fieldInfo?.type === 'String'
      const valueStr = isStringType && !condition.value.startsWith('$')
        ? `"${condition.value}"`
        : condition.value

      line += `${varPrefix}: ${condition.className}(${condition.field} ${condition.operator} ${valueStr})`
    }

    lines.push(`    ${line}`)
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
    conditions.value = []
    return
  }

  try {
    const parsedConditions: Condition[] = []

    // 移除多余的空格和换行
    const cleanCode = code.trim().replace(/\s+/g, ' ')

    // 分割 and/or 逻辑操作符（不区分大小写）
    const parts = cleanCode.split(/\s+(and|or)\s+/i)

    let currentLogicOp: 'AND' | 'OR' | undefined = undefined

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]?.trim()

      if (!part) continue

      // 检查是否是逻辑操作符
      if (part.toLowerCase() === 'and') {
        currentLogicOp = 'AND'
        continue
      } else if (part.toLowerCase() === 'or') {
        currentLogicOp = 'OR'
        continue
      }

      // 解析条件：$变量: 类名(字段 操作符 值)
      const conditionMatch = part.match(/\$(\w+)\s*:\s*(\w+)\s*\(([^)]+)\)/)

      if (conditionMatch) {
        const variable = conditionMatch[1]
        const className = conditionMatch[2]
        const fieldExpression = conditionMatch[3]?.trim()

        if (!variable || !className || !fieldExpression) continue

        // 解析字段表达式
        let field = ''
        let operator = '=='
        let value = ''

        // 尝试匹配特殊操作符
        if (fieldExpression.includes(' contains ')) {
          const [f, v] = fieldExpression.split(' contains ')
          field = f?.trim() || ''
          operator = 'contains'
          value = v?.trim().replace(/['"]/g, '') || ''
        } else if (fieldExpression.includes(' matches ')) {
          const [f, v] = fieldExpression.split(' matches ')
          field = f?.trim() || ''
          operator = 'matches'
          value = v?.trim().replace(/['"]/g, '') || ''
        } else if (fieldExpression.includes(' memberOf ')) {
          const [f, v] = fieldExpression.split(' memberOf ')
          field = f?.trim() || ''
          operator = 'memberOf'
          value = v?.trim() || ''
        } else {
          // 匹配标准操作符
          const opMatch = fieldExpression.match(/(\w+)\s*(==|!=|>=|<=|>|<)\s*(.+)/)
          if (opMatch) {
            field = opMatch[1]?.trim() || ''
            operator = opMatch[2]?.trim() || '=='
            value = opMatch[3]?.trim().replace(/['"]/g, '') || ''
          } else {
            // 如果无法解析，跳过这个条件
            continue
          }
        }

        parsedConditions.push({
          id: Date.now().toString() + Math.random(),
          variable: variable,
          className: className,
          field: field,
          operator: operator,
          value: value,
          logicOperator: parsedConditions.length > 0 ? currentLogicOp : undefined
        })

        // 重置逻辑操作符
        currentLogicOp = undefined
      }
    }

    conditions.value = parsedConditions
  } catch (error) {
    console.error('解析 DRL when 代码失败:', error)
    // 解析失败时保持为空，让用户在代码模式下编辑
    conditions.value = []
  }
}

// 加载类数据
onMounted(async () => {
  classData.value = await loadClassData()

  if (props.modelValue && props.modelValue.trim()) {
    parseDrlCode(props.modelValue)
  } else {
    // 只有在没有初始值时才添加默认条件
    addCondition()
  }
})

// 监听外部代码变化（如从代码模式切换回来）
watch(() => props.modelValue, (newValue) => {
  if (!isUpdatingFromCode.value && newValue) {
    parseDrlCode(newValue)
  }
})
</script>

<template>
  <div class="condition-builder">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">条件构建器</span>
        <el-tag size="small" type="info">可视化</el-tag>
      </div>
      <el-button
        size="small"
        type="primary"
        :icon="Plus"
        @click="addCondition"
      >
        添加条件
      </el-button>
    </div>

    <VueDraggable
      v-model="conditions"
      :animation="200"
      handle=".drag-handle"
      ghostClass="dragging-ghost"
      @end="updateDrlCode"
      class="space-y-3"
    >
      <div
        v-for="(condition, index) in conditions"
        :key="condition.id"
        class="condition-item bg-gray-50 rounded-lg p-3 border border-gray-200"
      >
        <!-- 逻辑操作符 -->
        <div v-if="index > 0" class="mb-2">
          <el-radio-group v-model="condition.logicOperator" size="small" @change="updateDrlCode">
            <el-radio-button
              v-for="op in logicOperators"
              :key="op.value"
              :label="op.value"
            >
              <span class="inline-flex items-center gap-1.5">
                <component :is="op.icon" :size="14" :class="op.color" />
                <span>{{ op.label }}</span>
              </span>
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="flex gap-2 items-start">
          <!-- 拖拽手柄 -->
          <div class="drag-handle flex items-center justify-center w-8 h-full min-h-[32px] cursor-move hover:bg-gray-200 rounded transition-colors mt-5">
            <GripVertical :size="16" class="text-gray-400" />
          </div>

          <div class="grid grid-cols-12 gap-2 items-start flex-1">
            <!-- 变量名 -->
            <div class="col-span-2">
              <label class="text-xs text-gray-600 mb-1 block">变量名</label>
              <el-input
                v-model="condition.variable"
                size="small"
                placeholder="p"
                @change="updateDrlCode"
              >
                <template #prefix>
                  <span class="text-gray-400">$</span>
                </template>
              </el-input>
            </div>

            <!-- 类名 -->
            <div class="col-span-2">
              <label class="text-xs text-gray-600 mb-1 block">类</label>
              <el-select
                v-model="condition.className"
                size="small"
                placeholder="选择类"
                filterable
                @change="updateDrlCode"
                class="w-full"
              >
                <el-option
                  v-for="cls in availableClasses"
                  :key="cls.name"
                  :label="cls.name"
                  :value="cls.name"
                >
                  <div class="flex flex-col">
                    <span>{{ cls.name }}</span>
                    <span class="text-xs text-gray-500">{{ cls.description }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- 字段 -->
            <div class="col-span-2">
              <label class="text-xs text-gray-600 mb-1 block">字段</label>
              <el-select
                v-model="condition.field"
                size="small"
                placeholder="选择字段"
                filterable
                @change="updateDrlCode"
                :disabled="!condition.className"
                class="w-full"
              >
                <el-option
                  v-for="field in getClassFields(condition.className)"
                  :key="field.name"
                  :label="field.name"
                  :value="field.name"
                >
                  <div class="flex flex-col">
                    <span>{{ field.name }}</span>
                    <span class="text-xs text-gray-500">{{ field.type }} - {{ field.description }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- 操作符 -->
            <div class="col-span-2">
              <label class="text-xs text-gray-600 mb-1 block">操作符</label>
              <el-select
                v-model="condition.operator"
                size="small"
                @change="updateDrlCode"
                class="w-full"
              >
                <el-option
                  v-for="op in operators"
                  :key="op.value"
                  :label="op.label"
                  :value="op.value"
                />
              </el-select>
            </div>

            <!-- 值 -->
            <div class="col-span-3">
              <label class="text-xs text-gray-600 mb-1 block">值</label>
              <el-input
                v-model="condition.value"
                size="small"
                placeholder="输入值"
                @change="updateDrlCode"
              />
            </div>

            <!-- 删除按钮 -->
            <div class="col-span-1 flex items-end">
              <el-button
                size="small"
                type="danger"
                :icon="X"
                circle
                @click="removeCondition(condition.id)"
                :disabled="conditions.length === 1"
              />
            </div>
          </div>
        </div>
      </div>
    </VueDraggable>

    <!-- 生成的代码预览 -->
    <div class="mt-3">
      <el-collapse>
        <el-collapse-item title="查看生成的代码" name="preview">
          <pre class="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">{{ generateDrlCode() || '// 请配置条件' }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<style scoped>
.condition-builder {
  width: 100%;
}

.condition-item {
  transition: all 0.2s;
}

.condition-item:hover {
  border-color: #93c5fd;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* 拖拽时的幽灵元素样式 */
.dragging-ghost {
  opacity: 0.5;
  background: #e0f2fe;
  border: 2px dashed #0ea5e9;
}

/* 禁用 el-tag 的所有过渡动画 */
:deep(.el-tag) {
  transition: none !important;
  animation: none !important;
}
</style>

