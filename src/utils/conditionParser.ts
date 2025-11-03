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
 * 解析 DRL when 代码为条件对象数组
 */
export function parseWhenCode(code: string): Array<Condition & { logicalOp?: 'and' | 'or' }> {
  if (!code || code.trim().length === 0) {
    return []
  }

  try {
    // 移除多余的空格，但保留换行
    const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const conditions: Array<Condition & { logicalOp?: 'and' | 'or' }> = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // 检查是否是逻辑运算符
      const isAnd = /^\s*and\s+/i.test(line)
      const isOr = /^\s*or\s+/i.test(line)

      // 提取条件（移除 and/or 前缀）
      const conditionLine = line.replace(/^\s*(and|or)\s+/i, '').trim()
      const conditionMatch = conditionLine.match(/^\s*\$(\w+)\s*:\s*(\w+)\s*\(([^)]+)\)/)

      if (conditionMatch) {
        const variable = conditionMatch[1]
        const className = conditionMatch[2]
        const fieldExpression = conditionMatch[3]?.trim()

        if (variable && className && fieldExpression) {
          const { field, operator, value } = parseFieldExpression(fieldExpression)

          const condition: Condition & { logicalOp?: 'and' | 'or' } = {
            id: `${Date.now()}-${i}`,
            variable: variable,
            className: className,
            field: field,
            operator: operator,
            value: value,
            logicalOp: i > 0 ? (isOr ? 'or' : 'and') : undefined
          }

          conditions.push(condition)
        }
      }
    }

    return conditions
  } catch (error) {
    console.error('解析 DRL when 代码失败:', error)
    return []
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
 * 从条件对象数组生成 DRL when 代码
 */
export function generateWhenCode(
  conditions: Array<Condition & { logicalOp?: 'and' | 'or' }> | Condition | null,
  getClassFields?: (className: string) => ClassField[]
): string {
  // 兼容单个条件的情况
  if (!conditions) {
    return ''
  }

  const conditionsArray = Array.isArray(conditions) ? conditions : [conditions]

  if (conditionsArray.length === 0) {
    return ''
  }

  const lines: string[] = []

  conditionsArray.forEach((condition, index) => {
    if (!condition.className || !condition.field) {
      return
    }

    let line = generateConditionExpression(condition, getClassFields)

    // 如果不是第一个条件，添加逻辑运算符
    if (index > 0 && condition.logicalOp) {
      const op = condition.logicalOp === 'or' ? 'or' : 'and'
      line = `    ${op} ${line.trim()}`
    }

    lines.push(line)
  })

  return lines.join('\n')
}

