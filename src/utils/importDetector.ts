/**
 * 自动检测导入工具
 */

/**
 * 从代码中提取 Java 类名
 * 匹配模式：
 * 1. 类型声明: Person(...), Order(...)
 * 2. 变量声明: $p: Person, $order: Order
 * 3. 静态方法调用: DateUtils.format(...), StringUtils.isEmpty(...)
 */
export function extractClassNames(code: string): Set<string> {
  const classNames = new Set<string>()

  // 移除注释
  const cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')

  // 匹配模式1: Type(...) - 类型构造或条件
  const typePattern = /\b([A-Z][a-zA-Z0-9]*)\s*\(/g
  let match
  while ((match = typePattern.exec(cleanCode)) !== null) {
    classNames.add(match[1])
  }

  // 匹配模式2: $var: Type - 变量声明
  const varPattern = /\$\w+\s*:\s*([A-Z][a-zA-Z0-9]*)/g
  while ((match = varPattern.exec(cleanCode)) !== null) {
    classNames.add(match[1])
  }

  // 匹配模式3: ClassName.method - 静态方法调用
  const staticPattern = /\b([A-Z][a-zA-Z0-9]*)\./g
  while ((match = staticPattern.exec(cleanCode)) !== null) {
    classNames.add(match[1])
  }

  // 过滤掉 Java 内置类型和关键字
  const builtInTypes = new Set([
    'String', 'Integer', 'Long', 'Double', 'Float', 'Boolean',
    'Short', 'Byte', 'Character', 'BigDecimal', 'BigInteger',
    'Date', 'List', 'Map', 'Set', 'Collection', 'Object',
    'Math', 'System', 'Arrays', 'Collections'
  ])

  return new Set([...classNames].filter(name => !builtInTypes.has(name)))
}

/**
 * 从规则列表中提取所有使用的类名
 */
export function extractClassNamesFromRules(rules: Rule[]): Set<string> {
  const allClassNames = new Set<string>()

  rules.forEach(rule => {
    // 从 when 条件中提取
    if (rule.when) {
      const whenClasses = extractClassNames(rule.when)
      whenClasses.forEach(name => allClassNames.add(name))
    }

    // 从 then 动作中提取
    if (rule.then) {
      const thenClasses = extractClassNames(rule.then)
      thenClasses.forEach(name => allClassNames.add(name))
    }
  })

  return allClassNames
}

/**
 * 生成 import 语句
 * 默认使用 com.example.model 作为包名前缀
 */
export function generateImportStatements(classNames: Set<string>, packagePrefix: string = 'com.example.model'): string[] {
  return Array.from(classNames)
    .sort()
    .map(className => `import ${packagePrefix}.${className};`)
}

/**
 * 检查导入语句中是否已包含某个类
 */
export function hasImport(imports: string[], className: string): boolean {
  return imports.some(imp => imp.includes(`.${className};`) || imp.endsWith(`.${className}`))
}

/**
 * 获取缺失的导入
 */
export function getMissingImports(
  existingImports: string[],
  classNames: Set<string>,
  packagePrefix: string = 'com.example.model'
): string[] {
  const missingImports: string[] = []

  classNames.forEach(className => {
    if (!hasImport(existingImports, className)) {
      missingImports.push(`import ${packagePrefix}.${className};`)
    }
  })

  return missingImports.sort()
}

/**
 * 从现有导入中提取包前缀
 * 如果有多个包，返回最常用的一个
 */
export function extractPackagePrefix(imports: string[]): string {
  const prefixes = new Map<string, number>()

  imports.forEach(imp => {
    const match = imp.match(/import\s+([\w.]+)\.\w+;/)
    if (match) {
      const prefix = match[1]
      prefixes.set(prefix, (prefixes.get(prefix) || 0) + 1)
    }
  })

  if (prefixes.size === 0) {
    return 'com.example.model'
  }

  // 返回使用次数最多的包前缀
  return Array.from(prefixes.entries())
    .sort((a, b) => b[1] - a[1])[0][0]
}

