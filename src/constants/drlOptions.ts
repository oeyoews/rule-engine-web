/**
 * DRL 编辑器常量配置
 */

/**
 * 包名选项
 */
export const packageOptions = [
  { value: 'com.example.rules', label: 'com.example.rules (示例包)' },
  { value: 'com.company.drools.rules', label: 'com.company.drools.rules (公司规则包)' },
  { value: 'com.myapp.business.rules', label: 'com.myapp.business.rules (业务规则包)' },
  { value: 'org.example.rules', label: 'org.example.rules (组织规则包)' },
  { value: 'cn.example.rules', label: 'cn.example.rules (中文域名包)' }
]

/**
 * 全局变量选项
 */
export const globalOptions = [
  { value: 'global org.slf4j.Logger logger;', label: 'Logger (日志)' },
  { value: 'global java.util.Map dataMap;', label: 'Map (数据映射)' },
  { value: 'global java.util.List resultList;', label: 'List (结果列表)' },
  { value: 'global com.example.service.RuleService ruleService;', label: 'RuleService (规则服务)' },
  { value: 'global com.example.util.DateUtils dateUtils;', label: 'DateUtils (日期工具)' },
  { value: 'global com.example.util.StringUtils stringUtils;', label: 'StringUtils (字符串工具)' }
]

