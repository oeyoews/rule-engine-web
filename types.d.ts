// 配置接口
interface Config {
  package: string
  globals: string[]
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
}