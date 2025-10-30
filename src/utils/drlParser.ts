/**
 * 解析 DRL 文件内容
 */
export function parseDrlFile(content: string): ParsedDrl {
  const result: ParsedDrl = {
    package: '',
    imports: [],
    globals: [],
    description: '',
    rules: []
  }

  // 提取文件描述（从头部注释中）
  const descMatch = content.match(/\*\s*描述:\s*(.+)/i)
  if (descMatch?.[1]) {
    result.description = descMatch[1].trim()
  }

  // 提取 package
  const packageMatch = content.match(/package\s+([\w.]+)\s*;/)
  if (packageMatch?.[1]) {
    result.package = packageMatch[1]
  }

  // 提取 imports
  const importRegex = /import\s+([\w.*]+)\s*;/g
  let importMatch
  while ((importMatch = importRegex.exec(content)) !== null) {
    // 存储完整的 import 语句
    result.imports.push(`import ${importMatch[1]};`)
  }

  // 提取 globals
  const globalRegex = /global\s+([\w.<>]+\s+\w+)\s*;/g
  let globalMatch
  while ((globalMatch = globalRegex.exec(content)) !== null) {
    // 存储完整的 global 语句
    result.globals.push(`global ${globalMatch[1]};`)
  }

  // 提取规则
  const ruleRegex = /rule\s+"([^"]+)"([\s\S]*?)end/g
  let ruleMatch

  while ((ruleMatch = ruleRegex.exec(content)) !== null) {
    const ruleName = ruleMatch[1]
    const ruleBody = ruleMatch[2]

    if (!ruleName || !ruleBody) {
      continue
    }

    // 初始化规则对象
    const rule: Rule = {
      name: ruleName,
      enabled: true,
      salience: 0,
      noLoop: false,
      lockOnActive: false,
      when: '',
      then: '',
      visualMode: false // 导入的规则默认使用代码模式
    }

    // 提取规则属性
    const enabledMatch = ruleBody.match(/enabled\s+(false)/i)
    if (enabledMatch) {
      rule.enabled = false
    }

    const salienceMatch = ruleBody.match(/salience\s+(\d+)/i)
    if (salienceMatch?.[1]) {
      rule.salience = parseInt(salienceMatch[1])
    }

    const noLoopMatch = ruleBody.match(/no-loop\s+true/i)
    if (noLoopMatch) {
      rule.noLoop = true
    }

    const lockOnActiveMatch = ruleBody.match(/lock-on-active\s+true/i)
    if (lockOnActiveMatch) {
      rule.lockOnActive = true
    }

    // 提取 when 部分
    const whenMatch = ruleBody.match(/when\s+([\s\S]*?)(?=then)/i)
    if (whenMatch?.[1]) {
      rule.when = whenMatch[1].trim()
    }

    // 提取 then 部分
    const thenMatch = ruleBody.match(/then\s+([\s\S]*?)$/i)
    if (thenMatch?.[1]) {
      rule.then = thenMatch[1].trim()
    }

    result.rules.push(rule)
  }

  return result
}

/**
 * 验证 DRL 文件格式
 */
export function validateDrlFile(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: '文件内容为空' }
  }

  // 检查是否包含 package 声明
  if (!content.match(/package\s+[\w.]+\s*;/)) {
    return { valid: false, error: '缺少 package 声明' }
  }

  // 检查是否包含至少一个规则
  if (!content.match(/rule\s+"[^"]+"/)) {
    return { valid: false, error: '文件中没有找到规则定义' }
  }

  return { valid: true }
}

