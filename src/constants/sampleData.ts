/**
 * DRL 编辑器示例数据
 */

/**
 * 示例配置
 */
export const sampleConfig = {
  package: 'com.example.rules',
  imports: ['import com.example.model.Person;'],
  globals: ['global org.slf4j.Logger logger;'],
  description: '示例规则文件'
}

/**
 * 示例规则
 */
export const sampleRules: Rule[] = [
  {
    name: 'CheckAdult',
    enabled: true,
    salience: 10,
    noLoop: true,
    lockOnActive: false,
    when: '    $p: Person($age: age >= 18)',
    then: '    $p.setAdult(true);\n    logger.info("{} 已成年",$p.getName());\n    update($p);',
    visualMode: true  // 默认开启可视化模式
  },
  {
    name: 'CheckSex',
    enabled: true,
    salience: 15,
    noLoop: false,
    lockOnActive: false,
    when: '    $p : Person(sex == "girl")',
    then: '    logger.warn("{} 是一个女孩", $p.getName());\n    $p.setSex("boy");\n    update($p);',
    visualMode: true  // 默认开启可视化模式
  }
]

