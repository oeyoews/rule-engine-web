<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { loadClassData, type ClassData, type ClassMethod } from '@/utils/classImport'

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

// 动作类型选项
const actionTypes = [
  { label: '调用方法', value: 'method', icon: '📞' },
  { label: '更新对象 (update)', value: 'update', icon: '🔄' },
  { label: '插入对象 (insert)', value: 'insert', icon: '➕' },
  { label: '删除对象 (retract)', value: 'retract', icon: '❌' },
  { label: '修改对象 (modify)', value: 'modify', icon: '✏️' },
  { label: '调用函数', value: 'function', icon: '⚡' }
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
  const code = generateDrlCode()
  emit('update:modelValue', code)
}

// 解析 DRL 代码（初始化时使用）
const parseDrlCode = (_code: string) => {
  // 简化的解析器
  actions.value = []
}

// 加载类数据
onMounted(async () => {
  classData.value = await loadClassData()

  if (props.modelValue) {
    parseDrlCode(props.modelValue)
  }

  // 如果没有动作，添加第一个
  if (actions.value.length === 0) {
    addAction()
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

    <div class="space-y-3">
      <div
        v-for="(action, index) in actions"
        :key="action.id"
        class="action-item bg-green-50 rounded-lg p-3 border border-green-200"
      >
        <div class="flex items-center gap-2 mb-3">
          <div class="text-xs font-medium text-gray-600">动作 {{ index + 1 }}</div>
          <el-divider direction="vertical" />
          <el-radio-group v-model="action.type" size="small" @change="updateDrlCode">
            <el-radio-button
              v-for="type in actionTypes"
              :key="type.value"
              :label="type.value"
            >
              {{ type.icon }} {{ type.label }}
            </el-radio-button>
          </el-radio-group>
          <div class="flex-1"></div>
          <el-button
            size="small"
            type="danger"
            :icon="X"
            circle
            @click="removeAction(action.id)"
          />
        </div>

        <!-- 调用方法 -->
        <div v-if="action.type === 'method' || action.type === 'function'" class="space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-600 mb-1 block">对象/类</label>
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
                  />
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
                />
              </el-select>
            </div>

            <div>
              <label class="text-xs text-gray-600 mb-1 block">方法</label>
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
                  <div class="flex flex-col">
                    <span>{{ method.name }}</span>
                    <span class="text-xs text-gray-500">{{ method.description }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>

          <!-- 方法参数 -->
          <div v-if="action.params.length > 0" class="pl-4 border-l-2 border-green-300">
            <label class="text-xs text-gray-600 mb-2 block">参数</label>
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
          <label class="text-xs text-gray-600 mb-1 block">对象变量</label>
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
              />
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
            <label class="text-xs text-gray-600 mb-1 block">对象变量</label>
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
                />
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
            <label class="text-xs text-gray-600 mb-1 block">修改方法</label>
            <el-input
              v-model="action.method"
              size="small"
              placeholder="方法名"
              @change="updateDrlCode"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 生成的代码预览 -->
    <div class="mt-3">
      <el-collapse>
        <el-collapse-item title="查看生成的代码" name="preview">
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
}

.action-item:hover {
  border-color: #4ade80;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
</style>

