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
    description: '检查人员是否成年，年龄大于等于18岁时标记为成年人',
    when: '    $p: Person($age: age >= 18) // 检查年龄是否大于等于18岁',
    then: '    $p.setAdult(true); // 设置成年状态\n    logger.info("{} 已成年",$p.getName()); // 记录日志\n    update($p); // 更新对象',
    visualMode: true  // 默认开启可视化模式
  },
  {
    name: 'CheckSex',
    enabled: true,
    salience: 15,
    noLoop: false,
    lockOnActive: false,
    description: '检查人员性别，当性别为女孩时记录警告日志并更新性别',
    when: '    $p : Person(sex == "girl") // 检查性别是否为女孩',
    then: '    logger.warn("{} 是一个女孩", $p.getName()); // 记录警告日志\n    $p.setSex("boy"); // 更新性别\n    update($p); // 更新对象',
    visualMode: true  // 默认开启可视化模式
  },
  {
    name: 'DefaultPriorityRule',
    enabled: true,
    salience: 0,
    noLoop: false,
    lockOnActive: false,
    description: '检查人员姓名是否存在，优先级为0的规则不会在代码中生成salience行',
    when: '    $p: Person($name: name != null) // 检查姓名是否不为空',
    then: '    logger.info("{} 姓名存在", $p.getName()); // 记录信息日志',
    visualMode: true  // 默认开启可视化模式，优先级为0不会被生成到代码中
  }
]

