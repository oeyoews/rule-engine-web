<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Box, Hash, Equal, EqualNot, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Regex, Code2, Filter } from 'lucide-vue-next'
import { loadClassData, type ClassData, type ClassField } from '@/utils/classImport'

interface Condition {
  id: string
  variable: string
  className: string
  field: string
  operator: string
  value: string
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

// 操作符图标映射与颜色
const operatorIconMap: Record<string, any> = {
  '==': Equal,
  '!=': EqualNot,
  '>': ChevronRight,
  '<': ChevronLeft,
  '>=': ChevronsRight,
  '<=': ChevronsLeft,
  'contains': Filter,
  'matches': Regex,
  'memberOf': Box
}

const operatorColorMap: Record<string, string> = {
  '==': 'text-purple-600',
  '!=': 'text-rose-600',
  '>': 'text-orange-600',
  '<': 'text-blue-600',
  '>=': 'text-orange-600',
  '<=': 'text-blue-600',
  'contains': 'text-emerald-600',
  'matches': 'text-indigo-600',
  'memberOf': 'text-teal-600'
}


// 逻辑操作符功能已移除，每个规则只能有一个条件

// 获取当前条件（用于模板）
const currentCondition = computed(() => conditions.value[0])

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

// 添加条件 - 确保只有一个条件
const addCondition = () => {
  if (conditions.value.length === 0) {
    const newCondition: Condition = {
      id: Date.now().toString(),
      variable: 'p',
      className: '',
      field: '',
      operator: '==',
      value: ''
    }
    conditions.value.push(newCondition)
    updateDrlCode()
  }
}

// 删除条件功能已移除，每个规则只能有一个条件

// 生成 DRL when 代码
const generateDrlCode = (): string => {
  if (conditions.value.length === 0) return ''

  const condition = conditions.value[0]
  if (!condition || !condition.className || !condition.field) return ''

  // 生成条件表达式
  const varPrefix = `$${condition.variable}`

  if (condition.operator === 'contains') {
    return `    ${varPrefix}: ${condition.className}(${condition.field} contains "${condition.value}")`
  } else if (condition.operator === 'matches') {
    return `    ${varPrefix}: ${condition.className}(${condition.field} matches "${condition.value}")`
  } else if (condition.operator === 'memberOf') {
    return `    ${varPrefix}: ${condition.className}(${condition.field} memberOf ${condition.value})`
  } else {
    // 判断值的类型来决定是否加引号
    const fieldInfo = getClassFields(condition.className).find(f => f.name === condition.field)
    const isStringType = fieldInfo?.type === 'String'
    const valueStr = isStringType && !condition.value.startsWith('$')
      ? `"${condition.value}"`
      : condition.value

    return `    ${varPrefix}: ${condition.className}(${condition.field} ${condition.operator} ${valueStr})`
  }
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

// 解析 DRL 代码（初始化时使用）- 只解析第一个条件
const parseDrlCode = (code: string) => {
  if (!code || code.trim().length === 0) {
    conditions.value = []
    return
  }

  try {
    // 移除多余的空格和换行
    const cleanCode = code.trim().replace(/\s+/g, ' ')

    // 只解析第一个条件（移除 and/or 后面的部分）
    const firstConditionMatch = cleanCode.match(/^\s*\$(\w+)\s*:\s*(\w+)\s*\(([^)]+)\)/)

    if (firstConditionMatch) {
      const variable = firstConditionMatch[1]
      const className = firstConditionMatch[2]
      const fieldExpression = firstConditionMatch[3]?.trim()

      if (variable && className && fieldExpression) {
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
          }
        }

        conditions.value = [{
          id: Date.now().toString(),
          variable: variable,
          className: className,
          field: field,
          operator: operator,
          value: value
        }]
        return
      }
    }

    conditions.value = []
  } catch (error) {
    console.error('解析 DRL when 代码失败:', error)
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
  if (!isUpdatingFromCode.value) {
    if (newValue && newValue.trim()) {
      parseDrlCode(newValue)
    }
    // 如果解析后没有条件，添加默认条件
    if (conditions.value.length === 0) {
      addCondition()
    }
  }
})
</script>

<template>
  <div class="condition-builder">
    <div class="flex items-center gap-2 mb-3">
      <Filter :size="16" class="text-blue-600 shrink-0" />
      <span class="text-sm font-medium text-gray-700">条件构建器</span>
      <el-tag size="small" type="primary">可视化</el-tag>
    </div>

    <div v-if="currentCondition" class="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div class="grid grid-cols-12 gap-2 items-center">
            <!-- 变量名 -->
            <div class="col-span-2">
              <label class="text-xs text-gray-600 mb-1 block">① 变量名</label>
              <el-input
                v-if="currentCondition"
                v-model="currentCondition.variable"
                size="small"
                placeholder="p"
                @change="updateDrlCode"
              >
                <template #prefix>
                  <span class="text-cyan-600 font-mono">$</span>
                </template>
              </el-input>
            </div>

            <!-- 类名 -->
            <div class="col-span-2">
              <label class="text-xs text-gray-600 mb-1 block">② 类</label>
              <el-select
                v-if="currentCondition"
                v-model="currentCondition.className"
                size="small"
                placeholder="选择类"
                filterable
                @change="updateDrlCode"
                class="w-full"
              >
                <template #prefix>
                  <Box :size="14" class="text-indigo-600 ml-1" />
                </template>
                <el-option
                  v-for="cls in availableClasses"
                  :key="cls.name"
                  :label="cls.name"
                  :value="cls.name"
                >
                  <div class="flex items-center gap-2">
                    <Box :size="16" class="text-indigo-600" />
                    <div class="flex flex-col">
                      <span>{{ cls.name }}</span>
                    </div>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- 字段 -->
            <div class="col-span-2">
              <label class="text-xs text-gray-600 mb-1 block">③ 字段</label>
              <el-select
                v-if="currentCondition"
                v-model="currentCondition.field"
                size="small"
                placeholder="选择字段"
                filterable
                @change="updateDrlCode"
                :disabled="!currentCondition.className"
                class="w-full"
              >
                <template #prefix>
                  <Hash :size="14" class="text-teal-600 ml-1" />
                </template>
                <el-option
                  v-for="field in getClassFields(currentCondition.className)"
                  :key="field.name"
                  :label="field.name"
                  :value="field.name"
                >
                  <div class="flex items-center gap-2">
                    <Hash :size="16" class="text-teal-600" />
                    <div class="flex flex-col">
                      <span>{{ field.name }}</span>
                    </div>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- 操作符 -->
            <div class="col-span-2">
              <label class="text-xs text-gray-600 mb-1 block">④ 操作符</label>
              <el-select
                v-if="currentCondition"
                v-model="currentCondition.operator"
                size="small"
                @change="updateDrlCode"
                class="w-full"
              >
                <template #prefix>
                  <component :is="operatorIconMap[currentCondition.operator] || Equal" :size="14" :class="operatorColorMap[currentCondition.operator] || 'text-purple-600'" class="ml-1" />
                </template>
                <el-option
                  v-for="op in operators"
                  :key="op.value"
                  :label="op.label"
                  :value="op.value"
                >
                  <div class="flex items-center gap-2">
                    <component :is="operatorIconMap[op.value] || Equal" :size="16" :class="operatorColorMap[op.value] || 'text-purple-600'" />
                    <span>{{ op.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- 值 -->
            <div class="col-span-3">
              <label class="text-xs text-gray-600 mb-1 block">⑤ 值</label>
              <el-input
                v-if="currentCondition"
                v-model="currentCondition.value"
                size="small"
                placeholder="输入值"
                @change="updateDrlCode"
              >
                <template #prefix>
                  <Code2 :size="14" class="text-emerald-600 ml-1" />
                </template>
              </el-input>
            </div>
          </div>
    </div>

    <!-- 生成的代码预览 -->
    <div class="mt-3">
      <div class="mb-2 flex items-center gap-2">
        <Code2 :size="16" class="text-blue-600 shrink-0" />
        <span class="text-sm font-medium text-gray-700">生成的代码</span>
      </div>
      <pre class="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">{{ generateDrlCode() || '// 请配置条件' }}</pre>
    </div>
  </div>
</template>

<style scoped>
.condition-builder {
  width: 100%;
}

/* 拖拽时的幽灵元素样式 */
.dragging-ghost {
  opacity: 0.5;
  background: #dbeafe;
  border: 2px dashed #60a5fa;
}

/* 禁用 el-tag 的所有过渡动画 */
:deep(.el-tag) {
  transition: none !important;
  animation: none !important;
}

</style>


