# DRL 规则编辑器 - 快速开始

## 🚀 快速启动

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发服务器
```bash
pnpm dev
```

浏览器会自动打开 `http://localhost:5173`

### 3. 开始使用

#### 基本操作流程

1. **配置全局信息**
   - 设置包名（package）
   - 添加导入语句（import）
   - 定义全局变量（global）

2. **添加规则**
   - 点击"添加规则"按钮
   - 填写规则名称
   - 设置规则选项（启用、No-Loop、Lock-Active）
   - 配置优先级（Salience）
   - 编写 When 条件
   - 编写 Then 动作

3. **预览和导出**
   - 右侧实时预览生成的 DRL 代码
   - 点击"下载 DRL 文件"保存
   - 或点击"复制代码"复制到剪贴板

## 📝 示例

### 加载示例规则

点击"加载示例"按钮，系统会自动填充一个完整的示例：

```drl
package com.example.rules;

import com.example.droolsdemo.model.Person;
import com.example.droolsdemo.util.RuleUtils;

global org.slf4j.Logger logger;

rule "CheckAdult"
    enabled true
    salience 10
    no-loop true
when
    $p: Person($age: age >= 18)
then
    $p.setAdult(true);
    logger.info("{} 已成年",$p.getName());
    update($p);
end
```

## 🎯 组件说明

### DrlEditor 组件

位置：`src/components/DrlEditor.vue`

#### Props
该组件目前没有 props，所有数据都在组件内部管理。

#### 功能特性
- ✅ 全局配置管理
- ✅ 规则CRUD操作
- ✅ 实时代码预览
- ✅ DRL文件下载
- ✅ 代码复制功能
- ✅ 示例规则加载

#### 数据结构

**Config（全局配置）**
```typescript
interface Config {
  package: string        // 包名
  imports: string        // 导入语句（多行）
  globals: string        // 全局变量（多行）
  declarations: string   // 类型声明
}
```

**Rule（规则）**
```typescript
interface Rule {
  name: string           // 规则名称
  enabled: boolean       // 是否启用
  salience: number       // 优先级 (0-999)
  noLoop: boolean        // 防止循环触发
  lockOnActive: boolean  // 锁定激活
  when: string           // 条件语句
  then: string           // 动作语句
}
```

## 🛠 开发技巧

### 1. 自定义样式

在 `src/components/DrlEditor.vue` 的 `<style scoped>` 中添加：

```vue
<style scoped>
.custom-class {
  /* 你的样式 */
}
</style>
```

### 2. 添加新功能

```vue
<script setup lang="ts">
// 添加新的响应式数据
const newFeature = ref(false)

// 添加新的方法
const handleNewFeature = () => {
  // 你的逻辑
}
</script>
```

### 3. 集成到其他页面

```vue
<script setup lang="ts">
import DrlEditor from '@/components/DrlEditor.vue'
</script>

<template>
  <div>
    <DrlEditor />
  </div>
</template>
```

## 📦 构建部署

### 构建生产版本
```bash
pnpm build
```

构建结果在 `dist/` 目录

### 本地预览构建结果
```bash
pnpm preview
```

## 🔧 常见问题

### Q: Element Plus 组件不显示？
A: 确保在 `main.ts` 中已全局注册 Element Plus：
```typescript
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

app.use(ElementPlus)
```

### Q: Tailwind 样式不生效？
A: 检查 `src/main.ts` 是否导入了 Tailwind CSS：
```typescript
import '@/styles/tailwind.css'
```

### Q: TypeScript 报错？
A: 运行类型检查：
```bash
pnpm build
```

## 📚 相关文档

- [Vue 3 文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Drools 文档](https://docs.drools.org/)

## 🤝 贡献

如有问题或建议，欢迎提交 Issue 或 Pull Request。

