import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import { saveAs } from 'file-saver'
import { extractImportsFromDrl, generateImportStatements } from './classImport'
import { indentLine } from './indent'

/**
 * 换行符常量
 */
const NEW_LINE = '\n'

/**
 * 规则属性键名常量
 */
const RuleAttribute = {
  ENABLED: 'enabled',
  SALIENCE: 'salience',
  NO_LOOP: 'noLoop',
  LOCK_ON_ACTIVE: 'lockOnActive'
} as const

/**
 * 规则属性生成器映射
 */
type AttributeGenerator = (rule: Rule) => string | null

const attributeGenerators: Record<string, AttributeGenerator> = {
  [RuleAttribute.ENABLED]: (rule: Rule) => {
    return rule.enabled === false ? indentLine('enabled false') + NEW_LINE : null
  },
  [RuleAttribute.SALIENCE]: (rule: Rule) => {
    return rule.salience !== undefined ? indentLine(`salience ${rule.salience}`) + NEW_LINE : null
  },
  [RuleAttribute.NO_LOOP]: (rule: Rule) => {
    return rule.noLoop ? indentLine('no-loop true') + NEW_LINE : null
  },
  [RuleAttribute.LOCK_ON_ACTIVE]: (rule: Rule) => {
    return rule.lockOnActive ? indentLine('lock-on-active true') + NEW_LINE : null
  }
}

/**
 * 格式化时间戳
 */
export const formatTimestamp = (date: Date = new Date()): string => {
  return moment(date).format('YYYY/MM/DD HH:mm:ss')
}

/**
 * 生成 DRL 文件头注释
 */
export const generateDrlHeader = (description?: string, drlId?: string, timestamp?: string): string => {
  const id = drlId || uuidv4()
  const time = timestamp || formatTimestamp()
  const desc = description || '自动生成的 Drools 规则文件'

  let header = `// ============================================${NEW_LINE}`
  header += `// DRL 规则文件${NEW_LINE}`
  header += `// ============================================${NEW_LINE}`
  header += `// 文件ID: ${id}${NEW_LINE}`
  header += `// 创建时间: ${time}${NEW_LINE}`
  header += `// 创建人: System${NEW_LINE}`
  header += `// 描述: ${desc}${NEW_LINE}`
  header += `// ============================================${NEW_LINE}${NEW_LINE}`

  return header
}

/**
 * 生成规则部分代码（不含header和package）
 */
function generateRulesCode(rules: Rule[]): string {
  let code = ''

  rules.forEach(rule => {
    code += `rule "${rule.name}"${NEW_LINE}`

    // 使用枚举映射生成规则属性
    Object.values(RuleAttribute).forEach(attr => {
      const generator = attributeGenerators[attr]
      if (generator) {
        const attributeCode = generator(rule)
        if (attributeCode) {
          code += attributeCode
        }
      }
    })

    // 关键字不缩进
    code += `when${NEW_LINE}`
    if (rule.when && rule.when.trim()) {
      // 处理 when 条件的缩进（一级缩进：4 个空格）
      const whenLines = rule.when.split(NEW_LINE)
      whenLines.forEach(line => {
        if (line.trim()) {
          code += indentLine(line) + NEW_LINE
        } else {
          code += NEW_LINE
        }
      })
    } else {
      // when 条件为空时，添加注释提示
      code += indentLine('// TODO: 请在此处添加规则条件') + NEW_LINE
    }
    // 关键字不缩进
    code += `then${NEW_LINE}`
    if (rule.then && rule.then.trim()) {
      // 处理 then 动作的缩进（一级缩进：4 个空格）
      const thenLines = rule.then.split(NEW_LINE)
      thenLines.forEach(line => {
        if (line.trim()) {
          code += indentLine(line) + NEW_LINE
        } else {
          code += NEW_LINE
        }
      })
    } else {
      // then 动作为空时，添加注释提示
      code += indentLine('// TODO: 请在此处添加规则动作') + NEW_LINE
    }
    // 关键字不缩进
    code += `end${NEW_LINE}${NEW_LINE}`
  })

  return code
}

/**
 * 生成 DRL 代码（同步版本，支持手动导入）
 */
export const generateDrlCode = (
  packageName: string,
  imports: string[],
  globals: string[],
  rules: Rule[],
  description?: string,
  drlId?: string,
  timestamp?: string
): string => {
  const pkg = packageName || 'com.example.rules'

  let code = generateDrlHeader(description, drlId, timestamp)

  code += `package ${pkg};${NEW_LINE}${NEW_LINE}`

  if (imports.length > 0) {
    imports.forEach(i => {
      code += `${i}${NEW_LINE}`
    })
    code += NEW_LINE
  }

  if (globals.length > 0) {
    globals.forEach(g => {
      code += `${g}${NEW_LINE}`
    })
    code += NEW_LINE
  }

  code += generateRulesCode(rules)

  return code
}

/**
 * 生成 DRL 代码（异步版本，自动添加import）
 */
export const generateDrlCodeWithImports = async (
  packageName: string,
  globals: string[],
  rules: Rule[],
  description?: string,
  drlId?: string,
  timestamp?: string,
  autoImport: boolean = true
): Promise<string> => {
  const pkg = packageName || 'com.example.rules'

  let code = generateDrlHeader(description, drlId, timestamp)

  code += `package ${pkg};${NEW_LINE.repeat(2)}`

  // 自动检测并添加import语句
  if (autoImport) {
    const rulesCode = generateRulesCode(rules)
    const fullCode = code + rulesCode

    try {
      const imports = await extractImportsFromDrl(fullCode)
      const importStatements = generateImportStatements(imports)

      if (importStatements) {
        code += importStatements
      }
    } catch (error) {
      console.error('Failed to generate imports:', error)
    }
  }

  if (globals.length > 0) {
    globals.forEach(g => {
      code += `${g}${NEW_LINE}`
    })
    code += NEW_LINE
  }

  code += generateRulesCode(rules)

  return code
}

/**
 * 下载文件
 */
export const downloadFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, filename)
}

