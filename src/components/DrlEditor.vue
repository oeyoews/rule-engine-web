<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Trash2 } from 'lucide-vue-next'

// 数据定义
const config = ref<Config>({
  package: 'com.example.rules',
  imports: '',
  globals: '',
  declarations: ''
})

const rules = ref<Rule[]>([])
const activeRules = ref<number | null>(0)
const copyButtonText = ref('复制代码')

/**
 * 添加新规则
 */
const addRule = () => {
  rules.value.push({
    name: 'rule_' + Date.now(),
    enabled: true,
    salience: 10,
    noLoop: false,
    lockOnActive: false,
    when: '',
    then: ''
  })
  // 自动展开新添加的规则
  activeRules.value = rules.value.length - 1
}

/**
 * 确认删除规则
 */
const confirmRemoveRule = (index: number) => {
  // @ts-ignore
  const ruleName = rules.value[index].name || `规则 ${index + 1}`
  ElMessageBox.confirm(
    `确定要删除规则"${ruleName}"吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    }
  ).then(() => {
    removeRule(index)
    ElMessage({
      type: 'success',
      message: '规则已删除'
    })
  }).catch(() => {
    // 用户取消删除
  })
}

/**
 * 删除规则
 */
const removeRule = (index: number) => {
  rules.value.splice(index, 1)
  // 删除规则后调整 activeRules
  if (activeRules.value !== null && activeRules.value >= rules.value.length && rules.value.length > 0) {
    activeRules.value = rules.value.length - 1
  } else if (rules.value.length === 0) {
    activeRules.value = null
  }
}

/**
 * 加载示例规则
 */
const loadSample = () => {
  // 设置全局配置
  config.value = {
    package: 'com.example.rules',
    imports: 'import com.example.droolsdemo.model.Person;\nimport com.example.droolsdemo.util.RuleUtils;',
    globals: 'global org.slf4j.Logger logger;',
    declarations: ''
  }

  // 设置规则示例
  rules.value = [
    {
      name: 'CheckAdult',
      enabled: true,
      salience: 10,
      noLoop: true,
      lockOnActive: false,
      when: '    $p: Person($age: age >= 18)',
      then: '    $p.setAdult(true);\n    logger.info("{} 已成年",$p.getName());\n    update($p);'
    },
    {
      name: 'CheckSex',
      enabled: true,
      salience: 15,
      noLoop: false,
      lockOnActive: false,
      when: '    $p : Person(sex == "girl")',
      then: '    logger.warn("{} 是一个女孩", $p.getName());\n    $p.setSex("boy");\n    update($p);'
    }
  ]
  // 展开第一个规则
  activeRules.value = 0
}

/**
 * 生成 DRL 代码
 */
const generateDRL = (): string => {
  const pkg = config.value.package || 'com.example.rules'
  const imports = config.value.imports.split('\n').filter(line => line.trim())
  const globals = config.value.globals.split('\n').filter(line => line.trim())
  const declarations = config.value.declarations

  let code = `package ${pkg};\n\n`

  if (imports.length > 0) {
    imports.forEach(imp => {
      code += `${imp.trim()}\n`
    })
    code += `\n`
  }

  if (declarations) {
    code += `${declarations}\n\n`
  }

  if (globals.length > 0) {
    globals.forEach(g => {
      code += `${g.trim()}\n`
    })
    code += `\n`
  }

  rules.value.forEach(rule => {
    code += `rule "${rule.name}"\n`
    if (rule.enabled !== undefined) {
      code += `    enabled ${rule.enabled}\n`
    }
    if (rule.salience !== undefined) {
      code += `    salience ${rule.salience}\n`
    }
    if (rule.noLoop) {
      code += `    no-loop true\n`
    }
    if (rule.lockOnActive) {
      code += `    lock-on-active true\n`
    }
    code += `when\n`
    if (rule.when) {
      code += `${rule.when}\n`
    }
    code += `then\n`
    if (rule.then) {
      const thenLines = rule.then.split('\n')
      thenLines.forEach(line => {
        code += `${line}\n`
      })
    }
    code += `end\n\n`
  })

  return code
}

/**
 * 下载 DRL 文件
 */
const downloadDRL = () => {
  const code = generateDRL()
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rules-${Date.now()}.drl`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 复制代码到剪贴板
 */
const copyCode = async () => {
  const code = generateDRL()
  try {
    await navigator.clipboard.writeText(code)
    copyButtonText.value = '已复制！'
    setTimeout(() => {
      copyButtonText.value = '复制代码'
    }, 2000)
  } catch (err) {
    ElMessage.error('复制失败: ' + err)
  }
}

/**
 * 返回首页
 */
const goHome = () => {
  window.location.href = '/'
}

// 组件挂载时初始化
onMounted(() => {
  // 初始化：添加第一个规则
  addRule()
  // 或者加载示例
  // loadSample()
})
</script>

<template>
  <div class="bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen p-4">
    <div class="max-w-7xl mx-auto space-y-4">
      <!-- 标题 -->
      <div class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <h1 class="text-2xl font-bold bg-linear-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              DRL 规则编辑器
            </h1>
            <p class="text-sm text-gray-600">可视化生成 Drools 规则文件</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <el-button type="warning" @click="loadSample" >
              加载示例
            </el-button>
            <el-button type="success" @click="downloadDRL" >
              下载 DRL 文件
            </el-button>
            <el-button
              :type="copyButtonText === '已复制！' ? 'success' : 'primary'"
              @click="copyCode"
              >
              {{ copyButtonText }}
            </el-button>
            <el-button type="info" @click="goHome" >
              返回首页
            </el-button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- 左侧：规则配置表单 -->
        <div class="space-y-4">
          <!-- 全局配置 -->
          <div class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200">
            <h2 class="text-lg font-semibold text-gray-700 mb-3">全局配置</h2>
            <el-form :model="config" label-width="140px" label-position="top">
              <el-form-item label="包名(package)">
                <el-input v-model="config.package" placeholder="com.example.rules"></el-input>
              </el-form-item>
              <el-form-item label="导入语句 (每行一个)">
                <el-input
                  v-model="config.imports"
                  type="textarea"
                  :rows="4"
                  placeholder="例如:&#10;import com.example.droolsdemo.model.Person;&#10;import com.example.droolsdemo.util.RuleUtils;&#10;import java.util.List;"
                  style="font-family: monospace;">
                </el-input>
              </el-form-item>
              <el-form-item label="全局变量 (每行一个)">
                <el-input
                  v-model="config.globals"
                  type="textarea"
                  :rows="3"
                  placeholder="例如:&#10;global org.slf4j.Logger logger;&#10;global java.util.Map dataMap;"
                  style="font-family: monospace;">
                </el-input>
              </el-form-item>
              <el-form-item label="声明类型 (declare, 可选)">
                <el-input
                  v-model="config.declarations"
                  type="textarea"
                  :rows="3"
                  placeholder="例如:&#10;declare Animal&#10;    name: String&#10;    age: int&#10;end"
                  style="font-family: monospace;">
                </el-input>
              </el-form-item>
            </el-form>
          </div>

          <!-- 规则列表 -->
          <div class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-lg font-semibold text-gray-700">规则列表</h2>
              <el-button type="primary" @click="addRule">
                + 添加规则
              </el-button>
            </div>
            <el-collapse v-model="activeRules" accordion>
              <el-collapse-item v-for="(rule, index) in rules" :key="index" :name="index">
                <template #title>
                  <div class="flex items-center justify-between w-full pr-4">
                    <div class="flex items-center gap-3">
                      <span class="font-semibold text-gray-700">
                        {{ rule.name || '规则 ' + (index + 1) }}
                      </span>
                      <el-tag v-if="rule.enabled" type="success">启用</el-tag>
                      <el-tag v-else type="info">禁用</el-tag>
                      <el-tag type="warning" v-if="rule.salience > 0">优先级: {{ rule.salience }}</el-tag>
                    </div>
                    <el-button
                      type="danger"
                      @click.stop="confirmRemoveRule(index)"
                      circle
                      plain>
                      <Trash2 :size="16" class="text-red-500" />
                    </el-button>
                  </div>
                </template>
                <el-form :model="rule" label-width="120px" label-position="top" class="pt-2">
                  <el-form-item label="规则名称">
                    <el-input v-model="rule.name" placeholder="规则名称"></el-input>
                  </el-form-item>
                  <el-form-item label="规则选项">
                    <div class="grid grid-cols-3 gap-2">
                      <el-checkbox v-model="rule.enabled">启用</el-checkbox>
                      <el-checkbox v-model="rule.noLoop">No-Loop</el-checkbox>
                      <el-checkbox v-model="rule.lockOnActive">Lock-Active</el-checkbox>
                    </div>
                  </el-form-item>
                  <el-form-item label="优先级 (salience)">
                    <el-input-number v-model="rule.salience" :min="0" :max="999"></el-input-number>
                  </el-form-item>
                  <el-form-item label="When 条件">
                    <el-input
                      v-model="rule.when"
                      type="textarea"
                      :rows="2"
                      placeholder="例如: $p: Person($age: age >= 18)"
                      style="font-family: monospace;">
                    </el-input>
                  </el-form-item>
                  <el-form-item label="Then 动作">
                    <el-input
                      v-model="rule.then"
                      type="textarea"
                      :rows="3"
                      placeholder="例如: $p.setAdult(true); update($p);"
                      style="font-family: monospace;">
                    </el-input>
                  </el-form-item>
                </el-form>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>

        <!-- 右侧：代码预览和帮助 -->
        <div class="space-y-4">
          <div class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200">
            <h2 class="text-lg font-semibold text-gray-700 mb-3">DRL 代码预览</h2>
            <pre class="bg-linear-to-br from-slate-50 to-slate-100 border border-slate-300 text-slate-800 p-4 rounded overflow-x-auto text-sm font-mono min-h-[400px] max-h-[600px] shadow-inner">{{ generateDRL() }}</pre>
          </div>

          <!-- 帮助说明 -->
          <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-semibold mb-1">使用提示：</p>
                <ul class="list-disc list-inside space-y-1 text-xs">
                  <li><strong>包名 (Package):</strong> 定义规则所属的包</li>
                  <li><strong>导入 (Import):</strong> 导入需要的Java类</li>
                  <li><strong>全局变量 (Global):</strong> 定义全局对象，如logger</li>
                  <li><strong>Salience:</strong> 规则优先级，数值越大越先执行</li>
                  <li><strong>No-Loop:</strong> 防止规则循环触发</li>
                  <li><strong>When:</strong> 规则条件（LHS - Left Hand Side）</li>
                  <li><strong>Then:</strong> 规则动作（RHS - Right Hand Side）</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>