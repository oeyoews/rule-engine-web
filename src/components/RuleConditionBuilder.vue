<script setup lang="ts">
import { Box, Hash, Equal, Code2, Filter, Plus, Trash2, Grip } from 'lucide-vue-next'
import { loadClassData, type ClassData, type ClassField } from '@/utils/classImport'
import {
  operators,
  operatorIconMap,
  operatorColorMap,
  DEFAULT_VARIABLE,
  DEFAULT_OPERATOR
} from '@/constants/operators'
import { generateWhenCode, parseWhenCode } from '@/utils/conditionParser'
import { VueDraggable } from 'vue-draggable-plus'

const modelValue = defineModel<string>()

const classData = ref<ClassData | null>(null)
const conditions = ref<Array<Condition>>([])
const isUpdatingFromCode = ref(false) // 防止循环更新

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

// 更新逻辑运算符（拖动后调用）
const updateLogicalOperators = () => {
  conditions.value.forEach((condition, index) => {
    if (index === 0) {
      condition.logicalOp = undefined
    } else if (!condition.logicalOp) {
      condition.logicalOp = 'and'
    }
  })
  updateDrlCode()
}

// 添加条件
const addCondition = () => {
  const newCondition: Condition = {
    id: Date.now().toString(),
    variable: DEFAULT_VARIABLE,
    className: '',
    field: '',
    operator: DEFAULT_OPERATOR,
    value: '',
    logicalOp: conditions.value.length > 0 ? 'and' : undefined
  }
  conditions.value.push(newCondition)
  updateDrlCode()
}

// 删除条件
const removeCondition = (id: string) => {
  const index = conditions.value.findIndex(c => c.id === id)
  if (index > -1) {
    conditions.value.splice(index, 1)
    // 如果是第一个条件被删除，移除第二个条件的逻辑运算符
    if (index === 0 && conditions.value.length > 0 && conditions.value[0]) {
      conditions.value[0].logicalOp = undefined
    }
    updateDrlCode()
  }
}

// 生成 DRL when 代码
const generateDrlCode = (): string => {
  if (conditions.value.length === 0) return ''
  return generateWhenCode(conditions.value, getClassFields)
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

// 解析 DRL 代码（初始化时使用）
const parseDrlCode = (code: string) => {
  conditions.value = parseWhenCode(code) || []
}

// 加载类数据
onMounted(async () => {
  classData.value = await loadClassData()

  if (modelValue.value && modelValue.value.trim()) {
    parseDrlCode(modelValue.value)
  } else {
    // 只有在没有初始值时才添加默认条件
    // addCondition()
  }
})

// 监听外部代码变化（如从代码模式切换回来）
watch(modelValue, (newValue) => {
  if (!isUpdatingFromCode.value) {
    if (newValue && newValue.trim()) {
      parseDrlCode(newValue)
    } else {
      // 如果代码为空或只有空白，清空条件
      conditions.value = []
    }
    // 如果解析后没有条件，或者代码为空，添加默认条件
    if (conditions.value.length === 0) {
      addCondition()
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <Filter :size="16" class="text-blue-600 shrink-0" />
        <span class="text-sm font-medium text-gray-700">条件构建器</span>
        <el-tag size="small" type="primary">可视化</el-tag>
      </div>
      <el-button type="primary" size="small" @click="addCondition">
        <Plus :size="14" class="mr-1" />
        添加条件
      </el-button>
    </div>

    <VueDraggable
      v-if="conditions.length > 0"
      v-model="conditions"
      :animation="200"
      handle=".condition-drag-handle"
      ghostClass="condition-dragging-ghost"
      @end="updateLogicalOperators"
      class="space-y-3"
    >
      <div
        v-for="(condition, index) in conditions"
        :key="condition.id"
        class="p-3 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div class="flex items-start gap-2 mb-2">
          <div class="condition-drag-handle flex items-center justify-center size-6 cursor-move hover:bg-blue-200 rounded transition-colors shrink-0 mt-5">
            <Grip :size="14" class="text-blue-600" />
          </div>
          <div class="flex-1">
            <div class="grid grid-cols-12 gap-2 items-center">
              <!-- 逻辑运算符 -->
              <div v-if="index > 0" class="col-span-1">
                <el-select
                  v-model="condition.logicalOp"
                  size="small"
                  @change="updateDrlCode"
                  class="w-full"
                >
                  <el-option label="AND" value="and" />
                  <el-option label="OR" value="or" />
                </el-select>
              </div>

              <!-- 变量名 -->
              <div :class="index > 0 ? 'col-span-2' : 'col-span-3'">
                <label class="text-xs text-gray-600 mb-1 block">① 变量名</label>
                <el-input
                  v-model="condition.variable"
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
              <div :class="index > 0 ? 'col-span-2' : 'col-span-3'">
                <label class="text-xs text-gray-600 mb-1 block">② 类</label>
                <el-select
                  v-model="condition.className"
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
              <div :class="index > 0 ? 'col-span-2' : 'col-span-3'">
                <label class="text-xs text-gray-600 mb-1 block">③ 字段</label>
                <el-select
                  v-model="condition.field"
                  size="small"
                  placeholder="选择字段"
                  filterable
                  @change="updateDrlCode"
                  :disabled="!condition.className"
                  class="w-full"
                >
                  <template #prefix>
                    <Hash :size="14" class="text-teal-600 ml-1" />
                  </template>
                  <el-option
                    v-for="field in getClassFields(condition.className)"
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
              <div :class="index > 0 ? 'col-span-2' : 'col-span-3'">
                <label class="text-xs text-gray-600 mb-1 block">④ 操作符</label>
                <el-select
                  v-model="condition.operator"
                  size="small"
                  @change="updateDrlCode"
                  class="w-full"
                >
                  <template #prefix>
                    <component :is="operatorIconMap[condition.operator] || Equal" :size="14" :class="operatorColorMap[condition.operator] || 'text-purple-600'" class="ml-1" />
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
              <div :class="index > 0 ? 'col-span-2' : 'col-span-3'">
                <label class="text-xs text-gray-600 mb-1 block">⑤ 值</label>
                <el-input
                  v-model="condition.value"
                  size="small"
                  placeholder="输入值"
                  @change="updateDrlCode"
                >
                  <template #prefix>
                    <Code2 :size="14" class="text-emerald-600 ml-1" />
                  </template>
                </el-input>
              </div>

              <!-- 删除按钮 -->
              <div class="col-span-1 flex items-end">
                <el-button
                  type="danger"
                  size="small"
                  :icon="Trash2"
                  circle
                  @click="removeCondition(condition.id)"
                  :disabled="conditions.length === 1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </VueDraggable>

    <div v-else class="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500 text-sm">
      暂无条件，点击"添加条件"按钮开始添加
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
/* 拖拽时的幽灵元素样式 */
.condition-dragging-ghost {
  opacity: 0.5;
  background: #dbeafe;
  border: 2px dashed #60a5fa;
}
</style>