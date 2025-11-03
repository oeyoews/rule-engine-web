/**
 * 条件操作符常量配置
 */
import {
  Box,
  Equal,
  EqualNot,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Regex,
  Filter
} from 'lucide-vue-next'

/**
 * 操作符选项
 */
export const operators = [
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

/**
 * 操作符图标映射
 */
export const operatorIconMap: Record<string, any> = {
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

/**
 * 操作符颜色映射
 */
export const operatorColorMap: Record<string, string> = {
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

/**
 * 默认变量名
 */
export const DEFAULT_VARIABLE = 'p'

/**
 * 默认操作符
 */
export const DEFAULT_OPERATOR = '=='

