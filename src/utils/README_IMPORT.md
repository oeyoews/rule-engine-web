# DRL 自动导入功能说明

## 功能概述

该功能能够自动检测 DRL 规则代码中使用的类和方法，并自动生成相应的 import 语句。

## 数据结构

### 类定义文件 (`public/mock/class.json`)

包含三种类型的类定义：
- `classes`: 实体类（如 Person, Order, Product）
- `utilities`: 工具类（如 DateUtils, StringUtils）
- `services`: 服务类（如 RuleService, NotificationService）

每个类包含：
- `name`: 类名
- `fullPath`: 完整类路径（用于生成 import 语句）
- `package`: 包路径
- `description`: 类描述
- `methods`: 方法列表
- `fields`: 字段列表（可选）

## 使用方法

### 1. 基础使用（同步版本，不自动导入）

```typescript
import { generateDrlCode } from '@/utils/drl'

const code = generateDrlCode(
  'com.example.rules',
  ['global org.slf4j.Logger logger;'],
  rules
)
```

### 2. 使用自动导入（异步版本）

```typescript
import { generateDrlCodeWithImports } from '@/utils/drl'

const code = await generateDrlCodeWithImports(
  'com.example.rules',
  ['global org.slf4j.Logger logger;'],
  rules,
  '规则描述',
  undefined,
  undefined,
  true  // 启用自动导入
)
```

### 3. 手动使用导入工具

```typescript
import {
  loadClassData,
  extractImportsFromDrl,
  generateImportStatements,
  findClassByName,
  searchMethods
} from '@/utils/classImport'

// 加载类数据
const classData = await loadClassData()

// 从 DRL 代码中提取需要导入的类
const drlCode = `
rule "CheckAdult"
when
    $p: Person($age: age >= 18)
then
    $p.setAdult(true);
    logger.info("成年人");
    update($p);
end
`

const imports = await extractImportsFromDrl(drlCode)
// imports = Set(['com.example.model.Person'])

const importStatements = generateImportStatements(imports)
// importStatements = "import com.example.model.Person;\n\n"
```

### 4. 查找类和方法信息

```typescript
// 根据类名查找类信息
const personClass = findClassByName(classData, 'Person')
console.log(personClass)
// {
//   name: 'Person',
//   fullPath: 'com.example.model.Person',
//   methods: [...],
//   ...
// }

// 搜索方法
const results = searchMethods(classData, 'setName')
console.log(results)
// [
//   {
//     className: 'Person',
//     method: { name: 'setName', ... },
//     classInfo: { ... }
//   }
// ]
```

## DRL 代码模式识别

### 类名识别

匹配 Drools 模式：`$variable: ClassName(...)`

```drl
$p: Person($age: age >= 18)
$order: Order(amount > 1000)
```

自动识别：`Person`, `Order`

### 方法名识别

#### 实例方法

```drl
$p.setAdult(true);
$order.setStatus("COMPLETED");
```

#### 静态方法

```drl
DateUtils.format(new Date(), "yyyy-MM-dd");
StringUtils.isEmpty(name);
```

## 生成的代码示例

### 输入规则

```javascript
const rules = [{
  name: 'CheckAdult',
  enabled: true,
  salience: 10,
  when: '    $p: Person($age: age >= 18)',
  then: '    $p.setAdult(true);\n    logger.info("成年人");\n    update($p);'
}]
```

### 生成的 DRL（不自动导入）

```drl
/*
 * ============================================
 * DRL 规则文件
 * ============================================
 * 文件ID: xxx-xxx-xxx
 * 创建时间: 2025/01/01 12:00:00
 * 创建人: System
 * 描述: 示例规则
 * ============================================
 */

package com.example.rules;

global org.slf4j.Logger logger;

rule "CheckAdult"
    salience 10
when
    $p: Person($age: age >= 18)
then
    $p.setAdult(true);
    logger.info("成年人");
    update($p);
end
```

### 生成的 DRL（自动导入）

```drl
/*
 * ============================================
 * DRL 规则文件
 * ============================================
 * 文件ID: xxx-xxx-xxx
 * 创建时间: 2025/01/01 12:00:00
 * 创建人: System
 * 描述: 示例规则
 * ============================================
 */

package com.example.rules;

import com.example.model.Person;

global org.slf4j.Logger logger;

rule "CheckAdult"
    salience 10
when
    $p: Person($age: age >= 18)
then
    $p.setAdult(true);
    logger.info("成年人");
    update($p);
end
```

## API 参考

### classImport.ts

- `loadClassData()`: 加载类定义数据
- `getAllClasses(data)`: 获取所有类
- `findClassByName(data, className)`: 根据类名查找类
- `findClassesByMethod(data, methodName)`: 根据方法名查找类
- `extractClassNamesFromDrl(drlCode)`: 从 DRL 提取类名
- `extractMethodNamesFromDrl(drlCode)`: 从 DRL 提取方法名
- `extractImportsFromDrl(drlCode)`: 提取需要导入的类
- `generateImportStatements(imports)`: 生成 import 语句
- `getClassMethods(data, className)`: 获取类的所有方法
- `getClassFields(data, className)`: 获取类的所有字段
- `searchMethods(data, keyword)`: 搜索方法

### drl.ts

- `generateDrlCode(...)`: 生成 DRL 代码（同步，不自动导入）
- `generateDrlCodeWithImports(...)`: 生成 DRL 代码（异步，自动导入）

## 扩展类定义

要添加新的类，编辑 `public/mock/class.json`：

```json
{
  "classes": [
    {
      "name": "YourClass",
      "fullPath": "com.example.model.YourClass",
      "package": "com.example.model",
      "description": "您的类描述",
      "methods": [
        {
          "name": "yourMethod",
          "returnType": "String",
          "params": [
            { "name": "param1", "type": "String" }
          ],
          "description": "方法描述"
        }
      ],
      "fields": [
        { "name": "field1", "type": "String", "description": "字段描述" }
      ]
    }
  ]
}
```

## 注意事项

1. 自动导入功能是异步的，需要使用 `await`
2. 类定义文件需要在应用启动时加载
3. 只有在 `class.json` 中定义的类才会被自动导入
4. 静态方法的类会被自动导入，实例方法通过类模式识别

