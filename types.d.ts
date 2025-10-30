// 配置接口
interface Config {
  package: string
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