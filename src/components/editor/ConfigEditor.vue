<script setup lang="ts">
import { computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Package,
  FileInput,
  Globe,
  FileText,
  CheckCircle,
  AlertTriangle,
  Upload,
  Lightbulb
} from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editorStore'
import { packageOptions, importOptions, globalOptions } from '@/constants/drlOptions'
import { sampleConfig, sampleRules } from '@/constants/sampleData'
import { extractClassNamesFromRules, getMissingImports, extractPackagePrefix } from '@/utils/importDetector'
import { parseDrlFile, validateDrlFile } from '@/utils/drlParser'

const editorStore = useEditorStore()

// 检测缺失的导入
const missingImports = computed(() => {
  const classNames = extractClassNamesFromRules(editorStore.rules)
  const packagePrefix = extractPackagePrefix(editorStore.config.imports)
  return getMissingImports(editorStore.config.imports, classNames, packagePrefix)
})

// 是否有缺失的导入
const hasMissingImports = computed(() => missingImports.value.length > 0)

/**
 * 自动添加缺失的导入
 */
const autoAddImports = () => {
  if (missingImports.value.length > 0) {
    editorStore.config.imports = [...editorStore.config.imports, ...missingImports.value]
    ElMessage.success(`已自动添加 ${missingImports.value.length} 个导入`)
  } else {
    ElMessage.info('没有需要添加的导入')
  }
}

// 监听规则变化，自动导入模式下自动添加缺失的导入
watch(
  () => [editorStore.rules, editorStore.autoImportMode],
  () => {
    if (editorStore.autoImportMode && hasMissingImports.value && !editorStore.advancedMode) {
      // 延迟执行，避免频繁触发
      setTimeout(() => {
        if (missingImports.value.length > 0) {
          editorStore.config.imports = [...editorStore.config.imports, ...missingImports.value]
        }
      }, 500)
    }
  },
  { deep: true }
)

/**
 * 加载示例规则
 */
const loadSample = () => {
  editorStore.config = { ...sampleConfig }
  editorStore.rules = [...sampleRules]
  if (editorStore.rules.length > 0) {
    editorStore.activeRules = 0
  }
  ElMessage.success('已加载示例规则')
}

/**
 * 导入 DRL 文件
 */
const importDrlFile = (file: File) => {
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const content = e.target?.result as string

      // 验证文件格式
      const validation = validateDrlFile(content)
      if (!validation.valid) {
        ElMessage.error(validation.error || '文件格式不正确')
        return
      }

      // 解析文件
      const parsed = parseDrlFile(content)

      // 填充配置
      editorStore.config = {
        package: parsed.package,
        imports: parsed.imports,
        globals: parsed.globals,
        description: parsed.description
      }

      // 填充规则
      editorStore.rules = parsed.rules

      // 展开第一个规则
      if (editorStore.rules.length > 0) {
        editorStore.activeRules = 0
      }

      ElMessage.success(`成功导入 ${parsed.rules.length} 个规则`)
    } catch (error) {
      console.error('解析 DRL 文件失败:', error)
      ElMessage.error('解析文件失败，请检查文件格式')
    }
  }

  reader.onerror = () => {
    ElMessage.error('读取文件失败')
  }

  reader.readAsText(file)
}

/**
 * 处理文件上传
 */
const handleFileUpload = (file: File) => {
  // 检查文件类型
  if (!file.name.endsWith('.drl')) {
    ElMessage.warning('请上传 .drl 格式的文件')
    return false
  }

  // 确认导入
  ElMessageBox.confirm(
    '导入文件将覆盖当前所有配置和规则，是否继续？',
    '确认导入',
    {
      confirmButtonText: '确定导入',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    importDrlFile(file)
  }).catch(() => {
    // 用户取消
  })

  return false // 阻止默认上传行为
}
</script>

<template>
  <div class="config-editor p-6">
    <div class="space-y-6">
      <!-- 操作按钮 -->
      <div class="flex gap-2 mb-4">
        <el-button
          type="warning"
          size="default"
          @click="loadSample"
        >
          <Lightbulb :size="18" class="mr-2" />
          加载示例
        </el-button>
        <el-upload
          :show-file-list="false"
          :before-upload="handleFileUpload"
          accept=".drl"
        >
          <el-button
            type="success"
            size="default"
          >
            <Upload :size="18" class="mr-2" />
            导入文件
          </el-button>
        </el-upload>
      </div>

      <!-- 全局配置表单 -->
      <el-form :model="editorStore.config" label-width="120px" label-position="top">
        <el-form-item>
          <template #label>
            <div class="flex items-center gap-2">
              <Package :size="16" class="text-amber-600" />
              <span>包名</span>
            </div>
          </template>
          <el-select
            v-model="editorStore.config.package"
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入包名"
            class="w-full"
            size="large"
          >
            <el-option
              v-for="item in packageOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="flex items-center gap-2">
                <Package :size="16" class="text-amber-600" />
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <template #label>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-2">
                <FileInput :size="16" class="text-purple-600" />
                <span>导入类</span>
              </div>
              <div class="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm ml-2">
                <span class="text-xs font-medium" :class="editorStore.autoImportMode ? 'text-emerald-600' : 'text-gray-500'">
                  {{ editorStore.autoImportMode ? '自动导入' : '手动导入' }}
                </span>
                <el-switch
                  v-model="editorStore.autoImportMode"
                  active-color="#10b981"
                  inactive-color="#94a3b8"
                  size="small"
                />
              </div>
            </div>
          </template>
          <el-select
            v-model="editorStore.config.imports"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入导入语句"
            class="w-full"
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="3"
            size="large"
          >
            <el-option
              v-for="item in importOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="flex items-center gap-2">
                <FileInput :size="16" class="text-purple-600" />
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
          <!-- 自动导入模式提示 -->
          <div v-if="editorStore.autoImportMode" class="mt-2 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 w-full">
            <CheckCircle :size="16" class="shrink-0" />
            <p class="text-xs font-medium">自动导入已启用，系统将自动检测并添加缺失的类导入</p>
          </div>
          <!-- 手动导入模式提示 -->
          <div v-else-if="!editorStore.autoImportMode && hasMissingImports" class="mt-2 flex items-center gap-3 justify-between text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 w-full">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <AlertTriangle :size="26" class="shrink-0 mt-0.5 mr-2" />
              <div class="flex-1 text-xs min-w-0">
                <p class="font-semibold mb-0.5">检测到 {{ missingImports.length }} 个未导入的类</p>
                <p class="text-gray-700">{{ missingImports.map(imp => imp.match(/\.(\w+);/)?.[1]).join(', ') }}</p>
              </div>
            </div>
            <el-button
              size="small"
              type="primary"
              @click="autoAddImports"
              class="shrink-0 self-center"
            >
              手动添加
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <template #label>
            <div class="flex items-center gap-2">
              <Globe :size="16" class="text-blue-600" />
              <span>全局变量</span>
            </div>
          </template>
          <el-select
            v-model="editorStore.config.globals"
            multiple
            placeholder="选择全局变量"
            class="w-full"
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="4"
            size="large"
          >
            <el-option
              v-for="item in globalOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="flex items-center gap-2">
                <Globe :size="16" class="text-blue-600" />
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <template #label>
            <div class="flex items-center gap-2">
              <FileText :size="16" class="text-green-600" />
              <span>描述</span>
            </div>
          </template>
          <el-input
            v-model="editorStore.config.description"
            type="textarea"
            :rows="3"
            placeholder="请输入规则文件的描述信息"
            maxlength="200"
            show-word-limit
            size="large"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
</style>
