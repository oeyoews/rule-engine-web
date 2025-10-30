<script setup lang="ts">
import { computed } from 'vue'
import {
  Code2, Download, Copy, Check
} from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { downloadFile } from '../utils/drl'
import CodeStatistics from './CodeStatistics.vue'
import hljs from 'highlight.js/lib/core'
import java from 'highlight.js/lib/languages/java'
import 'highlight.js/styles/atom-one-dark.css'

// 注册 Java 语言
hljs.registerLanguage('java', java)

// 双向绑定
const dialogVisible = defineModel<boolean>()

// Props
const props = defineProps<{
  code: string
  rulesCount: number
  enabledRulesCount: number
}>()

// 代码行数
const codeLines = computed(() => props.code.split('\n').length)

// 高亮后的代码（带行号）
const highlightedCode = computed(() => {
  const highlighted = hljs.highlight(props.code, { language: 'java' }).value
  const lines = highlighted.split('\n')

  return lines.map((line, index) => {
    const lineNumber = index + 1
    return `<div class="code-line">
      <span class="line-number">${lineNumber}</span>
      <span class="line-content">${line || ' '}</span>
    </div>`
  }).join('')
})

// 使用 VueUse 的 useClipboard (legacy 模式)
const { copy, copied, isSupported } = useClipboard({ legacy: true })

/**
 * 下载 DRL 文件
 */
const downloadDRL = () => {
  const filename = `rules-${Date.now()}.drl`
  downloadFile(props.code, filename)
}

/**
 * 复制代码到剪贴板
 */
const copyCode = async () => {
  if (!isSupported.value) {
    ElMessage.error('当前浏览器不支持复制功能')
    return
  }

  await copy(props.code)

  if (copied.value) {
    ElMessage.success('复制成功！')
  } else {
    ElMessage.error('复制失败')
  }
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="DRL 代码预览"
    width="65%"
    :close-on-click-modal="false"
    class="drl-preview-dialog"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 bg-linear-to-br from-emerald-100 to-green-200 rounded-lg">
          <Code2 :size="20" class="text-emerald-600" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-0">DRL 代码预览</h3>
          <p class="text-xs text-gray-500 mt-1">实时预览生成的 Drools 规则代码</p>
        </div>
      </div>
    </template>

    <!-- 代码预览区 -->
    <div class="space-y-3">
      <el-scrollbar max-height="550px" class="code-container rounded-lg shadow-xl overflow-hidden">
        <div class="code-wrapper" v-html="highlightedCode"></div>
      </el-scrollbar>

      <!-- 代码统计信息 -->
      <CodeStatistics
        :rules-count="rulesCount"
        :code-lines="codeLines"
        :enabled-rules-count="enabledRulesCount"
      />
    </div>

    <!-- 对话框底部按钮 -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button
          size="default"
          class="bg-linear-to-br! from-emerald-50! to-green-100! text-green-700! border! border-emerald-200! hover:border-green-400! hover:shadow-md! transition-all! duration-200!"
          @click="downloadDRL"
        >
          <Download :size="18" class="mr-2" />
          下载文件
        </el-button>
        <el-button
          size="default"
          :class="copied
            ? 'bg-linear-to-br! from-green-100! to-emerald-200! text-emerald-800! border! border-green-300! shadow-md! transition-all! duration-200!'
            : 'bg-linear-to-br! from-purple-50! to-indigo-100! text-indigo-700! border! border-purple-200! hover:border-indigo-400! hover:shadow-md! transition-all! duration-200!'
          "
          @click="copyCode"
        >
          <Copy v-if="!copied" :size="18" class="mr-2" />
          <Check v-else :size="18" class="mr-2" />
          {{ copied ? '已复制！' : '复制代码' }}
        </el-button>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.code-container {
  background: linear-gradient(135deg, #282c34 0%, #1e2127 100%);
}

.code-wrapper {
  padding: 1rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #abb2bf;
}

:deep(.code-line) {
  display: flex;
  min-height: 1.6em;
}

:deep(.code-line:hover) {
  background-color: rgba(255, 255, 255, 0.05);
}

:deep(.line-number) {
  display: inline-block;
  width: 1.5em;
  padding-right: 1em;
  text-align: right;
  color: #5c6370;
  user-select: none;
  flex-shrink: 0;
  border-right: 1px solid #3e4451;
  margin-right: 1em;
}

:deep(.line-content) {
  flex: 1;
  /* white-space: pre; */
  word-break: break-word;
}
</style>

