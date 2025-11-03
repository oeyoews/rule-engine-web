// 配置接口
interface Config {
  package: string
  imports: string[]
  globals: string[]
  description: string
}

// 规则接口
interface Rule {
  name: string
  enabled: boolean
  salience: number
  noLoop: boolean
  lockOnActive: boolean
  when: string
  then: string
  visualMode?: boolean  // 是否使用可视化模式
}

/**
 * DRL 文件解析器
 */

interface ParsedDrl {
  package: string
  imports: string[]
  globals: string[]
  description: string
  rules: Rule[]
}

interface Action {
  id: string
  type: 'method' | 'function' | 'update' | 'insert' | 'retract' | 'modify'
  object: string
  method: string
  params: Array<{ value: string }>
  description?: string
}


// 编辑器标签页类型
interface EditorTab {
  id: string
  type: 'config' | 'rule' | 'advanced' | 'preview'
  title: string
  component: any
  data?: any
  modified?: boolean
}


interface Condition {
  id: string
  variable: string
  className: string
  field: string
  operator: string
  value: string
  logicalOp?: 'and' | 'or'
}

