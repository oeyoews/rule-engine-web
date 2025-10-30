/**
 * 类导入工具
 * 用于自动检测DRL代码中使用的类和方法，并生成对应的import语句
 */

export interface ClassMethod {
  name: string
  returnType: string
  params: Array<{ name: string; type: string }>
  description: string
  static?: boolean
}

export interface ClassField {
  name: string
  type: string
  description: string
}

export interface ClassInfo {
  name: string
  fullPath: string
  package: string
  description: string
  methods: ClassMethod[]
  fields?: ClassField[]
}

export interface ClassData {
  classes: ClassInfo[]
  utilities: ClassInfo[]
  services: ClassInfo[]
}

let classData: ClassData | null = null

/**
 * 加载类定义数据
 */
export async function loadClassData(): Promise<ClassData> {
  if (classData) {
    return classData
  }

  try {
    const response = await fetch('/mock/class.json')
    classData = await response.json()
    return classData!
  } catch (error) {
    console.error('Failed to load class data:', error)
    return { classes: [], utilities: [], services: [] }
  }
}

/**
 * 获取所有类信息
 */
export function getAllClasses(data: ClassData): ClassInfo[] {
  return [...data.classes, ...data.utilities, ...data.services]
}

/**
 * 根据类名查找类信息
 */
export function findClassByName(data: ClassData, className: string): ClassInfo | undefined {
  const allClasses = getAllClasses(data)
  return allClasses.find(cls => cls.name === className)
}

/**
 * 根据方法名查找可能的类
 */
export function findClassesByMethod(data: ClassData, methodName: string): ClassInfo[] {
  const allClasses = getAllClasses(data)
  return allClasses.filter(cls =>
    cls.methods.some(method => method.name === methodName)
  )
}

/**
 * 从DRL代码中提取使用的类名
 * 匹配模式: $变量: ClassName(...)
 */
export function extractClassNamesFromDrl(drlCode: string): Set<string> {
  const classNames = new Set<string>()

  // 匹配 Drools 模式: $variable: ClassName(...)
  const patternRegex = /\$\w+\s*:\s*(\w+)\s*\(/g
  let match

  while ((match = patternRegex.exec(drlCode)) !== null) {
    classNames.add(match[1])
  }

  return classNames
}

/**
 * 从DRL代码中提取使用的方法名
 * 匹配模式: object.methodName(...) 或 ClassName.staticMethod(...)
 */
export function extractMethodNamesFromDrl(drlCode: string): Set<string> {
  const methodNames = new Set<string>()

  // 匹配实例方法: $variable.methodName(...)
  const instanceMethodRegex = /\$\w+\.(\w+)\s*\(/g
  let match

  while ((match = instanceMethodRegex.exec(drlCode)) !== null) {
    methodNames.add(match[1])
  }

  // 匹配静态方法: ClassName.methodName(...)
  const staticMethodRegex = /[A-Z]\w+\.(\w+)\s*\(/g
  while ((match = staticMethodRegex.exec(drlCode)) !== null) {
    methodNames.add(match[1])
  }

  return methodNames
}

/**
 * 从DRL代码中提取需要导入的类
 */
export async function extractImportsFromDrl(drlCode: string): Promise<Set<string>> {
  const data = await loadClassData()
  const imports = new Set<string>()

  // 提取类名
  const classNames = extractClassNamesFromDrl(drlCode)
  classNames.forEach(className => {
    const classInfo = findClassByName(data, className)
    if (classInfo) {
      imports.add(classInfo.fullPath)
    }
  })

  // 提取方法名并查找对应的工具类
  const methodNames = extractMethodNamesFromDrl(drlCode)
  methodNames.forEach(methodName => {
    const classes = findClassesByMethod(data, methodName)
    classes.forEach(cls => {
      // 只添加工具类和服务类的导入
      if (cls.methods.some(m => m.name === methodName && m.static)) {
        imports.add(cls.fullPath)
      }
    })
  })

  return imports
}

/**
 * 生成import语句
 */
export function generateImportStatements(imports: Set<string>): string {
  if (imports.size === 0) {
    return ''
  }

  const sortedImports = Array.from(imports).sort()
  return sortedImports.map(imp => `import ${imp};`).join('\n') + '\n\n'
}

/**
 * 获取类的所有方法（用于自动补全）
 */
export function getClassMethods(data: ClassData, className: string): ClassMethod[] {
  const classInfo = findClassByName(data, className)
  return classInfo ? classInfo.methods : []
}

/**
 * 获取类的所有字段（用于自动补全）
 */
export function getClassFields(data: ClassData, className: string): ClassField[] {
  const classInfo = findClassByName(data, className)
  return classInfo && classInfo.fields ? classInfo.fields : []
}

/**
 * 获取方法签名提示
 */
export function getMethodSignature(method: ClassMethod): string {
  const params = method.params.map(p => `${p.type} ${p.name}`).join(', ')
  return `${method.returnType} ${method.name}(${params})`
}

/**
 * 搜索方法（用于方法搜索功能）
 */
export function searchMethods(data: ClassData, keyword: string): Array<{
  className: string
  method: ClassMethod
  classInfo: ClassInfo
}> {
  const results: Array<{
    className: string
    method: ClassMethod
    classInfo: ClassInfo
  }> = []

  const allClasses = getAllClasses(data)

  allClasses.forEach(classInfo => {
    classInfo.methods.forEach(method => {
      if (
        method.name.toLowerCase().includes(keyword.toLowerCase()) ||
        method.description.includes(keyword)
      ) {
        results.push({
          className: classInfo.name,
          method,
          classInfo
        })
      }
    })
  })

  return results
}

