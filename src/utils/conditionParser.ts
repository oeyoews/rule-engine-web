/**
 * 条件解析和生成工具
 */
import { DEFAULT_OPERATOR } from '@/constants/operators'
import type { ClassField } from './classImport'

/**
 * 特殊操作符解析器映射
 */
const specialOperatorParsers: Record<string, (expr: string) => { field: string; operator: string; value: string } | null> = {
  'contains': (expr: string) => {
    const [f, v] = expr.split(' contains ')
    return f && v ? {
      field: f.trim(),
      operator: 'contains',
      value: v.trim().replace(/['"]/g, '')
    } : null
  },
  'matches': (expr: string) => {
    const [f, v] = expr.split(' matches ')
    return f && v ? {
      field: f.trim(),
      operator: 'matches',
      value: v.trim().replace(/['"]/g, '')
    } : null
  },
  'memberOf': (expr: string) => {
    const [f, v] = expr.split(' memberOf ')
    return f && v ? {
      field: f.trim(),
      operator: 'memberOf',
      value: v.trim()
    } : null
  }
}

/**
 * 解析字段表达式
 */
export function parseFieldExpression(fieldExpression: string): { field: string; operator: string; value: string } {
  // 尝试匹配特殊操作符
  for (const [op, parser] of Object.entries(specialOperatorParsers)) {
    if (fieldExpression.includes(` ${op} `)) {
      const result = parser(fieldExpression)
      if (result) return result
    }
  }

  // 匹配标准操作符
  const opMatch = fieldExpression.match(/(\w+)\s*(==|!=|>=|<=|>|<)\s*(.+)/)
  if (opMatch) {
    return {
      field: opMatch[1]?.trim() || '',
      operator: opMatch[2]?.trim() || DEFAULT_OPERATOR,
      value: opMatch[3]?.trim().replace(/['"]/g, '') || ''
    }
  }

  // 默认值
  return {
    field: '',
    operator: DEFAULT_OPERATOR,
    value: ''
  }
}

/**
 * 解析 DRL when 代码为条件对象
 */
export function parseWhenCode(code: string): Condition | null {
  if (!code || code.trim().length === 0) {
    return null
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
        const { field, operator, value } = parseFieldExpression(fieldExpression)

        return {
          id: Date.now().toString(),
          variable: variable,
          className: className,
          field: field,
          operator: operator,
          value: value
        }
      }
    }

    return null
  } catch (error) {
    console.error('解析 DRL when 代码失败:', error)
    return null
  }
}

/**
 * 生成条件表达式字符串
 */
function generateConditionExpression(
  condition: Condition,
  getClassFields?: (className: string) => ClassField[]
): string {
  const varPrefix = `$${condition.variable}`

  if (condition.operator === 'contains') {
    return `    ${varPrefix}: ${condition.className}(${condition.field} contains "${condition.value}")`
  } else if (condition.operator === 'matches') {
    return `    ${varPrefix}: ${condition.className}(${condition.field} matches "${condition.value}")`
  } else if (condition.operator === 'memberOf') {
    return `    ${varPrefix}: ${condition.className}(${condition.field} memberOf ${condition.value})`
  } else {
    // 判断值的类型来决定是否加引号
    const fieldInfo = getClassFields?.(condition.className)?.find(f => f.name === condition.field)
    const isStringType = fieldInfo?.type === 'String'
    const valueStr = isStringType && !condition.value.startsWith('$')
      ? `"${condition.value}"`
      : condition.value

    return `    ${varPrefix}: ${condition.className}(${condition.field} ${condition.operator} ${valueStr})`
  }
}

/**
 * 从条件对象生成 DRL when 代码
 */
export function generateWhenCode(
  condition: Condition | null,
  getClassFields?: (className: string) => ClassField[]
): string {
  if (!condition || !condition.className || !condition.field) {
    return ''
  }

  return generateConditionExpression(condition, getClassFields)
}

