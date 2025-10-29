import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import { saveAs } from 'file-saver'

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

  let header = `/*\n`
  header += ` * ============================================\n`
  header += ` * DRL 规则文件\n`
  header += ` * ============================================\n`
  header += ` * 文件ID: ${id}\n`
  header += ` * 创建时间: ${time}\n`
  header += ` * 创建人: System\n`
  header += ` * 描述: ${desc}\n`
  header += ` * ============================================\n`
  header += ` */\n\n`

  return header
}

/**
 * 生成 DRL 代码
 */
export const generateDrlCode = (
  packageName: string,
  globals: string[],
  rules: Rule[],
  description?: string,
  drlId?: string,
  timestamp?: string
): string => {
  const pkg = packageName || 'com.example.rules'

  let code = generateDrlHeader(description, drlId, timestamp)

  code += `package ${pkg};\n\n`

  if (globals.length > 0) {
    globals.forEach(g => {
      code += `${g}\n`
    })
    code += `\n`
  }

  rules.forEach(rule => {
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
 * 下载文件
 */
export const downloadFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, filename)
}

