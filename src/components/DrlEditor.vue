<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Trash2, HelpCircle, Lightbulb, Download, Copy, Check, Plus } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import HelpDialog from './HelpDialog.vue'
import SectionTitle from './SectionTitle.vue'

// 数据定义
const config = ref<Config>({
  package: '',
  globals: []
})

// 包名选项
const packageOptions = [
  { value: 'com.example.rules', label: 'com.example.rules (示例包)' },
  { value: 'com.company.drools.rules', label: 'com.company.drools.rules (公司规则包)' },
  { value: 'com.myapp.business.rules', label: 'com.myapp.business.rules (业务规则包)' },
  { value: 'org.example.rules', label: 'org.example.rules (组织规则包)' },
  { value: 'cn.example.rules', label: 'cn.example.rules (中文域名包)' }
]

// 全局变量选项
const globalOptions = [
  { value: 'global org.slf4j.Logger logger;', label: 'Logger (日志)' },
  { value: 'global java.util.Map dataMap;', label: 'Map (数据映射)' },
  { value: 'global java.util.List resultList;', label: 'List (结果列表)' },
  { value: 'global com.example.service.RuleService ruleService;', label: 'RuleService (规则服务)' },
  { value: 'global com.example.util.DateUtils dateUtils;', label: 'DateUtils (日期工具)' },
  { value: 'global com.example.util.StringUtils stringUtils;', label: 'StringUtils (字符串工具)' }
]

const rules = ref<Rule[]>([])
const activeRules = ref<number | string>(0)

// 控制帮助弹窗显示
const showHelpDialog = ref(false)

// 使用 VueUse 的 useClipboard (legacy 模式)
const { copy, copied, isSupported } = useClipboard({ legacy: true })

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
  if (typeof activeRules.value === 'number' && activeRules.value >= rules.value.length && rules.value.length > 0) {
    activeRules.value = rules.value.length - 1
  } else if (rules.value.length === 0) {
    activeRules.value = -1
  }
}

/**
 * 加载示例规则
 */
const loadSample = () => {
  // 设置全局配置
  config.value = {
    package: 'com.example.rules',
    globals: ['global org.slf4j.Logger logger;']
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
  const globals = config.value.globals

  let code = `package ${pkg};\n\n`

  if (globals.length > 0) {
    globals.forEach(g => {
      code += `${g}\n`
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
  if (!isSupported.value) {
    ElMessage.error('当前浏览器不支持复制功能')
    return
  }

  const code = generateDRL()
  await copy(code)

  if (copied.value) {
    ElMessage.success('复制成功！')
  } else {
    ElMessage.error('复制失败')
  }
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
            <el-button
              class="bg-linear-to-br! from-blue-50! to-blue-100! text-blue-700! border! border-blue-200! hover:border-blue-300! hover:shadow-md! transition-all!"
              @click="showHelpDialog = true"
            >
              <HelpCircle :size="16" class="mr-1" />
              使用帮助
            </el-button>
            <el-button
              class="bg-linear-to-br! from-cyan-50! to-teal-100! text-teal-700! border! border-cyan-200! hover:border-teal-300! hover:shadow-md! transition-all!"
              @click="loadSample"
            >
              <Lightbulb :size="16" class="mr-1" />
              加载示例
            </el-button>
            <el-button
              class="bg-linear-to-br! from-emerald-50! to-green-100! text-green-700! border! border-emerald-200! hover:border-green-300! hover:shadow-md! transition-all!"
              @click="downloadDRL"
            >
              <Download :size="16" class="mr-1" />
              下载 DRL 文件
            </el-button>
            <el-button
              :class="copied
                ? 'bg-linear-to-br! from-green-50! to-emerald-100! text-emerald-700! border! border-green-200! shadow-sm! transition-all!'
                : 'bg-linear-to-br! from-purple-50! to-indigo-100! text-indigo-700! border! border-purple-200! hover:border-indigo-300! hover:shadow-md! transition-all!'
              "
              @click="copyCode"
            >
              <Copy v-if="!copied" :size="16" class="mr-1" />
              <Check v-else :size="16" class="mr-1" />
              {{ copied ? '已复制！' : '复制代码' }}
            </el-button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- 左侧：规则配置表单 -->
        <div class="space-y-4">
          <!-- 全局配置 -->
          <div class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200">
            <SectionTitle>全局配置</SectionTitle>
            <el-form :model="config" label-width="140px" label-position="top">
              <el-form-item label="包名">
                <el-select
                  v-model="config.package"
                  filterable
                  allow-create
                  default-first-option
                  placeholder="选择或输入包名"
                  class="w-full"
                >
                  <el-option
                    v-for="item in packageOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="全局变量">
                <el-select
                  v-model="config.globals"
                  multiple
                  placeholder="选择全局变量"
                  class="w-full"
                  collapse-tags
                  collapse-tags-tooltip
                  :max-collapse-tags="3"
                >
                  <el-option
                    v-for="item in globalOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <!-- 规则列表 -->
          <div class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200">
            <div class="flex justify-between items-center mb-3">
              <SectionTitle class="mb-0">规则列表</SectionTitle>
              <el-button
                class="bg-linear-to-br! from-sky-50! to-blue-100! text-blue-700! border! border-sky-200! hover:border-blue-300! hover:shadow-md! transition-all!"
                @click="addRule"
              >
                <Plus :size="16" class="mr-1" />
                添加规则
              </el-button>
            </div>
            <el-collapse v-model="activeRules" accordion>
              <el-collapse-item v-for="(rule, index) in rules" :key="index" :name="index">
                <template #title>
                  <div class="flex items-center justify-between w-full pr-4 group">
                    <div class="flex items-center gap-3">
                      <span class="font-semibold text-gray-700">
                        {{ rule.name || '规则 ' + (index + 1) }}
                      </span>
                      <el-tag v-if="rule.enabled" class="bg-emerald-100! text-emerald-700! border-emerald-200! transition-none!">启用</el-tag>
                      <el-tag v-else class="bg-slate-100! text-slate-600! border-slate-200! transition-none!">禁用</el-tag>
                      <el-tag v-if="rule.salience > 0" class="bg-violet-100! text-violet-700! border-violet-200! transition-none!">优先级: {{ rule.salience }}</el-tag>
                    </div>
                      <Trash2 :size="12" class="group-hover:opacity-100 opacity-0 transition-all duration-200 delay-250 text-red-400 mr-2" @click.stop="confirmRemoveRule(index)" />
                  </div>
                </template>
                <el-form :model="rule" label-width="120px" label-position="top" class="pt-2">
                  <el-form-item label="规则名称">
                    <el-input v-model="rule.name" placeholder="规则名称"></el-input>
                  </el-form-item>
                  <el-form-item label="规则选项">
                    <div class="grid grid-cols-3 gap-2">
                      <el-checkbox v-model="rule.enabled">启用</el-checkbox>
                      <el-checkbox v-model="rule.noLoop">循环</el-checkbox>
                      <el-checkbox v-model="rule.lockOnActive">锁定</el-checkbox>
                    </div>
                  </el-form-item>
                  <el-form-item label="优先级 (salience)">
                    <el-input-number v-model="rule.salience" :min="0" :max="999"></el-input-number>
                  </el-form-item>
                  <el-form-item label="条件">
                    <el-input
                      v-model="rule.when"
                      type="textarea"
                      :rows="2"
                      placeholder="例如: $p: Person($age: age >= 18)"
                      style="font-family: monospace;">
                    </el-input>
                  </el-form-item>
                  <el-form-item label="动作">
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
            <SectionTitle>DRL 代码预览</SectionTitle>
            <el-scrollbar max-height="600px" class="bg-linear-to-br from-slate-50 to-slate-100 border border-slate-300 rounded shadow-inner">
              <pre class="text-slate-800 p-4 text-sm font-mono min-h-[400px]">{{ generateDRL() }}</pre>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>

    <!-- 帮助弹窗组件 -->
    <HelpDialog v-model="showHelpDialog" />
  </div>
</template>