import { computed, type Ref } from 'vue'
import hljs from 'highlight.js/lib/core'
import java from 'highlight.js/lib/languages/java'
import 'highlight.js/styles/atom-one-dark.css'

// 注册 Java 语言
hljs.registerLanguage('java', java)

export interface CodeHighlightOptions {
  language?: string
  showLineNumbers?: boolean
}

/**
 * 代码高亮 Composable
 *
 * @param code - 代码字符串（响应式引用）
 * @param options - 配置选项
 * @returns 高亮后的代码和工具函数
 */
export function useCodeHighlight(
  code: Ref<string> | (() => string),
  options: CodeHighlightOptions = {}
) {
  const {
    language = 'java',
    showLineNumbers = true
  } = options

  // 计算代码行数
  const codeLines = computed(() => {
    const codeStr = typeof code === 'function' ? code() : code.value
    return codeStr.split('\n').length
  })

  // 高亮后的代码
  const highlightedCode = computed(() => {
    const codeStr = typeof code === 'function' ? code() : code.value

    if (!codeStr || !codeStr.trim()) {
      return showLineNumbers ? '<div class="code-line"><span class="line-number">1</span><span class="line-content"> </span></div>' : ''
    }

    try {
      const highlighted = hljs.highlight(codeStr, { language }).value
      const lines = highlighted.split('\n')

      if (showLineNumbers) {
        return lines.map((line, index) => {
          const lineNumber = index + 1
          return `<div class="code-line">
            <span class="line-number">${lineNumber}</span>
            <span class="line-content">${line || ' '}</span>
          </div>`
        }).join('')
      }

      return highlighted
    } catch (error) {
      console.error('代码高亮失败:', error)
      // 如果高亮失败，返回原始代码
      const lines = codeStr.split('\n')
      if (showLineNumbers) {
        return lines.map((line, index) => {
          const lineNumber = index + 1
          return `<div class="code-line">
            <span class="line-number">${lineNumber}</span>
            <span class="line-content">${escapeHtml(line || ' ')}</span>
          </div>`
        }).join('')
      }
      return escapeHtml(codeStr)
    }
  })

  /**
   * 转义 HTML 特殊字符
   */
  function escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * 手动高亮代码（非响应式，用于纯函数场景）
   */
  function highlightCode(codeStr: string, lang: string = language): string {
    try {
      return hljs.highlight(codeStr, { language: lang }).value
    } catch (error) {
      console.error('代码高亮失败:', error)
      return escapeHtml(codeStr)
    }
  }

  return {
    highlightedCode,
    codeLines,
    highlightCode
  }
}

